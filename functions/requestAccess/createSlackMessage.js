export const createFirstMessage = (email, id) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:lock: ${email} har bedt om tilgang`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':heavy_check_mark: Gi tilgang',
            emoji: true,
          },
          value: `${id}`,
          action_id: 'accept',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':x: Slett forespørsel',
            emoji: true,
          },
          value: `${id}`,
          action_id: 'reject',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':no_entry_sign: Ignore',
            emoji: true,
          },
          value: `ignore`,
          action_id: 'ignore',
        },
      ],
    },
  ],
});

export const acceptMessage = (email, user) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:lock: ${email} har bedt om tilgang`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:heavy_check_mark: ${user} har godkjent forespørselen`,
      },
    },
  ],
});

export const rejectMessage = (email, user) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:lock: ${email} har bedt om tilgang`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:x: ${user} har avslått forespørselen`,
      },
    },
  ],
});
