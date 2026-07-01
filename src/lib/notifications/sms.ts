interface SMSParams {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSParams): Promise<{ success: boolean; error?: string }> {
  const provider = process.env.SMS_PROVIDER || 'semaphore';

  if (provider === 'twilio') {
    return sendViaTwilio(to, message);
  }

  return sendViaSemaphore(to, message);
}

async function sendViaSemaphore(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  const senderName = process.env.SEMAPHORE_SENDER_NAME || 'JencaAesthetics';

  if (!apiKey) {
    return { success: false, error: 'Semaphore API key not configured' };
  }

  try {
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        number: to,
        message,
        sendername: senderName,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Semaphore API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendViaTwilio(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Twilio API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function formatBookingSMS(
  clientName: string,
  serviceName: string,
  date: string,
  time: string
): string {
  return `Hi ${clientName}, your appointment at Jenca Aesthetics is confirmed: ${serviceName} on ${date} at ${time}. Reply STOP to opt out.`;
}

export function formatCancellationSMS(
  clientName: string,
  serviceName: string,
  date: string,
  time: string
): string {
  return `Hi ${clientName}, your appointment for ${serviceName} on ${date} at ${time} has been cancelled. Contact us if you have questions.`;
}

export function formatReminderSMS(
  clientName: string,
  serviceName: string,
  date: string,
  time: string
): string {
  return `Reminder: ${clientName}, you have an appointment tomorrow at Jenca Aesthetics: ${serviceName} on ${date} at ${time}. See you there!`;
}
