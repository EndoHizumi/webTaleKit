---
layout: home

hero:
  name: "webTaleKit"
  text: "Visual Novel Game Engine"
  tagline: Create interactive stories with HTML, CSS, and JavaScript
  image:
    src: /logo.jpg
    alt: webTaleKit
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/EndoHizumi/webTaleKit

features:
  - icon: 🎨
    title: Flexible UI Creation
    details: Design your game's interface using familiar web technologies. Customize everything from text windows to menu screens.

  - icon: 📝
    title: Simple Scenario Writing
    details: Write scenarios using an intuitive HTML-like markup language combined with JavaScript for advanced features.

  - icon: 🔧
    title: Easy Integration
    details: Built with TypeScript, making it easy to integrate into modern web development workflows.

  - icon: 📱
    title: Responsive Design
    details: Automatic scaling ensures your game looks great on any screen size, from desktop to mobile.

  - icon: 🎵
    title: Rich Media Support
    details: Built-in support for background music, sound effects, character sprites, and backgrounds.

  - icon: 🌐
    title: REST API Integration
    details: Connect to external APIs to create dynamic, data-driven narrative experiences.
---

## Quick Start

### Installation

```bash
npm install webtalekit-alpha
```

### Create Your First Scene

```html
<scenario>
  <text>The warmth of early September lingered...</text>
  <text>That's when she said it.</text>

  <choice prompt="How do you respond?">
    <item label="Stay silent">
      <text>You chose to remain quiet.</text>
    </item>
    <item label="Ask what she means">
      <text>You asked for clarification.</text>
    </item>
  </choice>
</scenario>
```

## Why webTaleKit?

webTaleKit is designed for creators who want the power of web technologies to build interactive narrative games. Whether you're a web developer looking to create visual novels, or a game creator wanting more control over your game's presentation, webTaleKit provides the tools you need.

## Learn More

- [Read the Guide](/en/guide/getting-started) - Learn how to use webTaleKit
- [API Reference](/en/api/overview) - Explore the API documentation
- [Tag Reference](/en/tags/) - Detailed tag specifications
- [GitHub Repository](https://github.com/EndoHizumi/webTaleKit) - View the source code

## License

MIT License - feel free to use webTaleKit in your projects!
