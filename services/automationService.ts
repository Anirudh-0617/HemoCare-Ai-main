
/**
 * Automation Service (n8n Integration)
 * Allows the local app to trigger external workflows.
 */

export const triggerAutomation = async (webhookUrl: string, eventType: string, payload: any) => {
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload
      }),
    });

    if (!response.ok) {
      console.warn(`Automation webhook failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Automation Service Error:', error);
  }
};
