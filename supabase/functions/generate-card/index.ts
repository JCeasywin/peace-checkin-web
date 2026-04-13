const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WAN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation";
const WAN_MODEL = "wan2.7-image";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("DASHSCOPE_API_KEY");

    if (!apiKey) {
      return jsonResponse(
        {
          error: "Missing DASHSCOPE_API_KEY",
          message: "请在 Supabase Edge Function Secrets 里配置 DASHSCOPE_API_KEY。",
        },
        500,
      );
    }

    const body = await req.json();
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return jsonResponse({ error: "Missing prompt" }, 400);
    }

    const createTask = await fetch(WAN_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: WAN_MODEL,
        input: {
          messages: [
            {
              role: "user",
              content: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        parameters: {
          size: "2K",
          n: 1,
          watermark: false,
          thinking_mode: true,
        },
      }),
    });

    const createData = await createTask.json();

    if (!createTask.ok) {
      return jsonResponse({ error: "Wan task creation failed", details: createData }, 502);
    }

    const taskId = createData.output?.task_id;

    if (!taskId) {
      return jsonResponse({ error: "Wan task id missing", details: createData }, 502);
    }

    const result = await pollTask(apiKey, taskId);
    const imageUrl = findFirstImageUrl(result);

    if (!imageUrl) {
      return jsonResponse({ error: "Wan image url missing", taskId, details: result }, 502);
    }

    return jsonResponse({ imageUrl, taskId, model: WAN_MODEL });
  } catch (error) {
    return jsonResponse(
      {
        error: "Generate card failed",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

async function pollTask(apiKey: string, taskId: string) {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

  for (let index = 0; index < 20; index += 1) {
    await sleep(3000);

    const response = await fetch(taskUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await response.json();
    const status = data.output?.task_status;

    if (status === "SUCCEEDED") {
      return data;
    }

    if (status === "FAILED" || status === "UNKNOWN") {
      throw new Error(`Wan task ${status}: ${JSON.stringify(data)}`);
    }
  }

  throw new Error("Wan task timeout");
}

function findFirstImageUrl(value: unknown): string {
  if (typeof value === "string") {
    const looksLikeImage =
      /^https?:\/\/.+\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(value) ||
      (/^https?:\/\//i.test(value) && /(aliyun|dashscope|oss|image|png|jpg|jpeg|webp)/i.test(value));
    return looksLikeImage ? value : "";
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstImageUrl(item);
      if (found) return found;
    }
    return "";
  }

  for (const item of Object.values(value)) {
    const found = findFirstImageUrl(item);
    if (found) return found;
  }

  return "";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
