import { Helmet } from "react-helmet";

export default function Seo() {
  return (
    <Helmet>
      <title>Portfolio & Document Management</title>
      <meta name="description" content="A dynamic personal portfolio and document management system" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Portfolio & Document Management" />
      <meta property="og:description" content="A dynamic personal portfolio and document management system" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Portfolio & Document Management" />
      <meta name="twitter:description" content="A dynamic personal portfolio and document management system" />
    </Helmet>
  );
}