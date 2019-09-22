---
title: Welcome to {{ app.name }}!
---
🎉 Congratulations, you now have successfuly created your very own Micropub endpoint. Before using it to post to your website, there are a few things you will need to set up.

### Enable automatic discovery

First, you’ll need to ensure this endpoint can be discovered by Micropub clients. You can do this by adding the follow value to your website’s `<head>`:

```html
<link rel="micropub" href="{{ app.url }}/micropub">
```

If you haven’t done so already, make sure you are also pointing to token and authorization endpoints. Clients use to check that you are the owner of the website you want to publish to. These values should also be included in your website’s `<head>`:

```html
<link rel="authorization_endpoint" href="https://indieauth.com/auth">
<link rel="token_endpoint" href="https://tokens.indieauth.com/token">
```

### Configure where and how {{ app.name }} publishes content

Configuration is provided via a JSON file in your repository. You can tell {{ app.name }} where to find this file by providing a value for the `INDIEKIT_CONFIG_PATH` environment variable. You can [learn about the available configuration options here](/website-configuration).
