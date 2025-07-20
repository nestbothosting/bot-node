const { CreateChannel, CancelTicket, UserInfo, ServerInfo, ClearMessage, Kick, Ban } = require('./event/event');
const { RemoveAutoRoleAdd } = require('../sp_event/autoroleadd')
const { MoveUser, Mute, TimeOut, SendTicketPanel } = require('./event/cmd')

const interactionCreate = (client) => {
     client.on("interactionCreate", async (interaction) => {
          try {
               if (interaction.isChatInputCommand()) {
                    if (interaction.commandName === "ping") {
                         return await interaction.reply("🏓 Pong!");
                    }
                    if (interaction.commandName === "say") {
                         const message = interaction.options.getString('message');
                         await interaction.reply(message);
                    }
                    if (interaction.commandName === 'userinfo') {
                         const user = interaction.options.getUser('user') || interaction.user;
                         const memberObj = interaction.guild ? await interaction.guild.members.fetch(user.id) : null;
                         UserInfo(interaction, user, memberObj)
                    }
                    if (interaction.commandName === 'serverinfo') {
                         const { guild } = interaction;
                         const owner = await guild.fetchOwner();
                         ServerInfo(guild, owner, interaction)
                    }
                    if (interaction.commandName === 'clear') {
                         const amount = interaction.options.getInteger('amount');
                         if (!interaction.channel || !interaction.channel.bulkDelete) {
                              return interaction.reply({
                                   content: "❌ This command can only be used in text channels.",
                                   ephemeral: true,
                              });
                         }
                         ClearMessage(interaction, amount)
                    }
                    if (interaction.commandName === 'kick') {
                         const user = interaction.options.getUser('user');
                         const reason = interaction.options.getString('reason') || 'No reason provided';
                         Kick(user, reason, interaction)
                    }
                    if (interaction.commandName === 'ban') {
                         const user = interaction.options.getUser('user');
                         const reason = interaction.options.getString('reason') || 'No reason provided';
                         Ban(user, reason, interaction)
                    }
                    if (interaction.commandName === 'remautorole') {
                         RemoveAutoRoleAdd(interaction)
                    }
                    if (interaction.commandName === 'moveuser') {
                         const user = interaction.options.getUser('user');
                         const channel = interaction.options.getChannel('channel');
                         MoveUser(channel, user, interaction)
                    }
                    if (interaction.commandName === 'mute') {
                         const user = interaction.options.getUser('user');
                         const shouldMute = interaction.options.getBoolean('mute');
                         Mute(user, shouldMute, interaction)
                    }
                    if (interaction.commandName === 'timeout') {
                         const member = interaction.options.getMember('member');
                         const duration = interaction.options.getNumber('duration');
                         const reason = interaction.options.getString('reason') || 'No reason provided';
                         TimeOut(member, duration, reason, interaction)
                    }
                    if(interaction.commandName === 'ticket_panel'){
                         SendTicketPanel(interaction)
                    }
               }

               if (interaction.isButton()) {
                    if (interaction.customId === 'ticket_create_btn') {
                         CreateChannel(interaction)
                    }
                    if (interaction.customId === 'cancel_ticket') {
                         CancelTicket(interaction)
                    }
               }
          } catch (error) {
               console.error("Error handling interaction:", error);

               // Ensure the interaction is not already replied to before sending an error response
               if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                         content: "❌ An error occurred while processing your request.",
                         ephemeral: true,
                    });
               }
          }
     });
};

module.exports = { interactionCreate };
