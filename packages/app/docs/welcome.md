---
title: Welcome to {{ app.name }}! 👋
---
Congratulations, you now have successfuly created your very own Micropub endpoint. Before using it to post to your website, there are a few things you will need to set up.

### Enable automatic discovery

To ensure this endpoint can be discovered by Micropub clients and then use it to publish content to your website, the follow values should be added to your website’s `<head>`:

```html
<link rel="micropub" href="{{ app.url }}/micropub">
<link rel="authorization_endpoint" href="https://indieauth.com/auth">
<link rel="token_endpoint" href="https://tokens.indieauth.com/token">
```

### Configure {{ app.name }}

Next, you should provide {{ app.name }} with the details of where and how you would like to publish files.

[Configure {{ app.name }} →](/configure/app)

### Configure where and how {{ app.name }} publishes content

Configuration is provided via a JSON file in your repository. You can tell {{ app.name }} where to find this file by providing a value for the `INDIEKIT_CONFIG_PATH` environment variable. You can [learn about the available configuration options here](/website-configuration).
