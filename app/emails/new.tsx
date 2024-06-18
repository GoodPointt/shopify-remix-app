import { Button, Html } from "@react-email/components";

const NewEmail = (props: { url: any }) => {
  const { url } = props;

  return (
    <Html>
      <Button href={url}>Click me</Button>
    </Html>
  );
};

export default NewEmail;
