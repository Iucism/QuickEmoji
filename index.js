const { Plugin } = require('powercord/entities');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');


// Emojis

module.exports = class QuickEmoji extends Plugin {
  async startPlugin () {
    const classes = {
      ...await getModule([ 'icon', 'isHeader' ]),
      ...await getModule([ 'button', 'separator', 'wrapper' ])
    };
    const reactionManager = await getModule([ 'addReaction' ]);
    const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');
    const emojis = [
      {
        name: '⭐',
        url: '/assets/e4d52f4d69d7bba67e5fd70ffe26b70d.svg'
      },
      {
        name: '❤️',
        url: '/assets/0483f2b648dcc986d01385062052ae1c.svg'
      }
    ];
    inject('emoji-button', MiniPopover, 'default', (_, res) => {
      const props = findInReactTree(res, r => r && r.canReact && r.message);
      if (!props || props.message.reactions.some(r => emojis.some(e => r.emoji.name === e.name) && r.me)) {
        return res;
      }

      res.props.children.unshift(...emojis.map(emoji => 
        React.createElement(
            'div', {
            key: emoji.name,
            className: classes.button,
            onClick: () => reactionManager.addReaction(props.channel.id, props.message.id, {
              animated: false,
              name: emoji.name,
              id: null
            })
          },
          React.createElement('img', {
            className: `emoji ${classes.icon}`,
            src: emoji.url, 
          })
        )  
      ));
      return res;
    });
    MiniPopover.default.displayName = 'MiniPopover';
  }

  pluginWillUnload () {
    uninject('emoji-button');
  }
};
