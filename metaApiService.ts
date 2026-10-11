import { Contact, MetaApiConfig, MetaTemplate } from '../types';

export interface SendMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: 'header' | 'body' | 'button';
      sub_type?: 'url' | 'quick_reply';
      index?: string;
      parameters: Array<{
        type: 'text' | 'image' | 'document' | 'video';
        text?: string;
        image?: { link: string };
      }>;
    }>;
  };
}

export class MetaApiService {
  /**
   * Replaces template placeholders like {{1}}, {{2}} with contact attributes
   */
  static interpolateTemplateBody(
    templateBody: string,
    mapping: Record<string, string>,
    contact: Contact
  ): string {
    let result = templateBody;
    for (const [varIndex, fieldKey] of Object.entries(mapping)) {
      let value = '';
      if (fieldKey === 'name') value = contact.name;
      else if (fieldKey === 'phone') value = contact.phone;
      else if (fieldKey === 'dni') value = contact.dni || '';
      else if (fieldKey === 'email') value = contact.email || '';
      else if (fieldKey === 'company') value = contact.company || '';
      else if (contact.customFields && contact.customFields[fieldKey]) {
        value = contact.customFields[fieldKey];
      } else {
        value = `[${fieldKey}]`;
      }

      result = result.replace(new RegExp(`\\{\\{${varIndex}\\}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Generates official Meta Graph API payload
   */
  static buildMetaPayload(
    template: MetaTemplate,
    mapping: Record<string, string>,
    contact: Contact
  ): SendMessagePayload {
    // Clean phone number: remove '+' and whitespace
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');

    const bodyParameters: Array<{ type: 'text'; text: string }> = [];

    // Order variables by index (1, 2, 3...)
    const sortedIndices = Object.keys(mapping).sort((a, b) => Number(a) - Number(b));
    for (const idx of sortedIndices) {
      const fieldKey = mapping[idx];
      let val = '';
      if (fieldKey === 'name') val = contact.name;
      else if (fieldKey === 'phone') val = contact.phone;
      else if (fieldKey === 'dni') val = contact.dni || '';
      else if (fieldKey === 'email') val = contact.email || '';
      else if (fieldKey === 'company') val = contact.company || '';
      else if (contact.customFields && contact.customFields[fieldKey]) {
        val = contact.customFields[fieldKey];
      } else {
        val = '';
      }
      bodyParameters.push({ type: 'text', text: val || 'Estimado/a' });
    }

    const components: SendMessagePayload['template']['components'] = [];

    if (bodyParameters.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyParameters,
      });
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: template.name.toLowerCase().replace(/\s+/g, '_'),
        language: {
          code: template.language || 'es',
        },
        components,
      },
    };
  }

  /**
   * Tests connection with Meta Graph API
   */
  static async testConnection(config: MetaApiConfig): Promise<{ success: boolean; message: string; details?: any }> {
    if (config.isSandboxMode) {
      // In sandbox mode, simulate a verified check
      await new Promise(r => setTimeout(r, 600));
      return {
        success: true,
        message: 'Modo Sandbox Activo: Conexión validada con éxito. Simulación de Webhooks lista.',
        details: {
          wabaId: config.wabaId || 'WABA_DEMO_998124',
          phoneNumberId: config.phoneNumberId || 'PHONE_DEMO_332144',
          displayPhoneNumber: '+52 55 9988 7766',
          qualityRating: 'GREEN',
          messagingTier: config.rateTier,
        },
      };
    }

    if (!config.accessToken || !config.phoneNumberId) {
      return {
        success: false,
        message: 'Por favor ingresa el Phone Number ID y el Meta Access Token.',
      };
    }

    try {
      const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: `Conexión oficial establecida con ${data.verified_name || data.display_phone_number}`,
          details: data,
        };
      } else {
        return {
          success: false,
          message: data?.error?.message || 'Error al conectar con la API de Meta Graph.',
          details: data?.error,
        };
      }
    } catch (err: any) {
      // If CORS or network issue, give clear helpful diagnostics
      return {
        success: false,
        message: `Error de red o verificación CORS: ${err.message || 'No se pudo contactar a Meta'}. Puedes usar el Modo Sandbox para probar sin restricciones.`,
      };
    }
  }

  /**
   * Sends a message through Meta Graph API or safe simulated sandbox
   */
  static async sendSingleMessage(
    config: MetaApiConfig,
    template: MetaTemplate,
    mapping: Record<string, string>,
    contact: Contact
  ): Promise<{
    success: boolean;
    metaMessageId: string;
    renderedText: string;
    error?: string;
  }> {
    const renderedText = this.interpolateTemplateBody(template.bodyText, mapping, contact);
    const payload = this.buildMetaPayload(template, mapping, contact);

    // If sandbox mode or demo token
    if (config.isSandboxMode || !config.accessToken || config.accessToken.startsWith('DEMO_')) {
      // Simulate realistic network roundtrip 120ms
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 150));
      
      // 98% success rate in simulation
      const isSuccess = Math.random() > 0.03;
      if (!isSuccess) {
        return {
          success: false,
          metaMessageId: '',
          renderedText,
          error: 'Número no registrado en WhatsApp o fuera de cobertura.',
        };
      }

      const randomId = 'wamid.HBgL' + Math.random().toString(36).substring(2, 12).toUpperCase() + '=';
      return {
        success: true,
        metaMessageId: randomId,
        renderedText,
      };
    }

    try {
      const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.messages && data.messages.length > 0) {
        return {
          success: true,
          metaMessageId: data.messages[0].id,
          renderedText,
        };
      } else {
        return {
          success: false,
          metaMessageId: '',
          renderedText,
          error: data?.error?.message || 'Error en respuesta de Meta',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        metaMessageId: '',
        renderedText,
        error: error.message || 'Error de conexión con Meta',
      };
    }
  }
}
