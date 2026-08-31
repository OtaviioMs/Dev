export async function checkUrl(url: string): Promise<{
  status: "up" | "down";
  statusCode: number | null;
  responseTime: number;
}> {
  const start = Date.now();

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - start;

    return {
      status: response.ok ? "up" : "down",
      statusCode: response.status,
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - start;

    return {
      status: "down",
      statusCode: null,
      responseTime
    };
  }
}