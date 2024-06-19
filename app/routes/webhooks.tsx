import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { Resend } from "resend";
import VercelInviteUserEmail from "~/emails/custom";
import { render } from "@react-email/components";

const resend = new Resend(import.meta.env.RESEND_API_KEY);
// const emailHtml = render(<VercelInviteUserEmail />);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  console.log(topic);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "CUSTOMERS_CREATE":
      console.log("===========HIT_CUSTOMERS_WEBHOOK=========");
      // console.log(payload);

      const emailHtml = render(
        <VercelInviteUserEmail
          teamName={"Awesome Shopping🛒"}
          username={payload.first_name + " " + payload.last_name}
          invitedByUsername={"New user"}
        />,
      );

      const { data, error } = await resend.emails.send({
        from: "Awesome Shopping🛒 <onboarding@resend.dev>",
        to: [payload.email],
        subject: "Welcome on board👋",
        html: emailHtml,
      });

      if (error) {
        return json({ error }, 400);
      }
      console.log("===========HIT_CUSTOMERS_WEBHOOK=========");

      return json({ data }, 200);

      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
