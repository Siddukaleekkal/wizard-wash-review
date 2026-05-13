module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rating, service, customerName } = req.body;

  // Validate rating
  if (![3, 4, 5].includes(rating)) {
    return res.status(400).json({ error: "Invalid rating" });
  }

  const ratingDescriptions = {
    5: "extremely satisfied, enthusiastic, would highly recommend",
    4: "very satisfied, happy with the results, would recommend",
    3: "satisfied, decent experience, results were acceptable",
  };

  const prompt = `You are writing a Google review on behalf of a real customer. Generate a natural, authentic-sounding Google review for "Wizard Wash", a pressure washing and exterior cleaning company.

Details:
- Customer rating: ${rating} out of 5 stars
- Customer sentiment: ${ratingDescriptions[rating]}
- Service received: ${service || "exterior cleaning"}
- Customer first name: ${customerName || "a homeowner"}

Requirements:
- Write in first person as the customer
- Keep it between 40-80 words
- Sound natural and human, not corporate or robotic
- Include the specific service they received
- Mention the business name "Wizard Wash" once naturally
- Include 1-2 SEO-relevant phrases naturally (like "power washing in Richmond VA", "exterior cleaning service", "soft wash", "house washing near me")
- Do NOT use exclamation marks more than once
- Do NOT use the word "definitely" or "highly recommend" together
- Vary sentence structure
- Make it feel like a real person wrote it on their phone

Respond with ONLY the review text. No quotes, no preamble, nothing else.`;

  try {
    const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return res.status(500).json({ error: "Failed to generate review" });
    }

    const data = await response.json();
    const review = data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!review) {
      return res.status(500).json({ error: "No review generated" });
    }

    return res.status(200).json({ review });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
