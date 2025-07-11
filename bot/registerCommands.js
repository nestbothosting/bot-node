const { REST, Routes, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

const registerCommands = (token, client_id) => {

    const commands = [
        {
            name: "ping",
            description: "Bot Ping.!!"
        },
        {
            name: "help",
            description: "help"
        },
        {
            name: "say",
            description: "Make the bot say something",
            default_member_permissions: String(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Administrator),
            options: [
                {
                    name: "message",
                    description: "The message the bot will say",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        },
        {
            name: "userinfo",
            description: "Get info about a user",
            default_member_permissions: String(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator),
            options: [
                {
                    name: "user",
                    description: "Select a user (optional)",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        },
        {
            name: "serverinfo",
            description: "Show information about this server",
            default_member_permissions: null
        },
        {
            name: "clear",
            description: "Clear a number of messages in this channel",
            default_member_permissions: String(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
            options: [
                {
                    name: "amount",
                    description: "Number of messages to delete (1-100)",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 100
                }
            ]
        },
        {
            name: "kick",
            description: "Kick a member from the server",
            default_member_permissions: String(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator),
            options: [
                {
                    name: "user",
                    description: "The member to kick",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "Reason for the kick",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name: "ban",
            description: "Ban a member from the server",
            default_member_permissions: String(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator),
            options: [
                {
                    name: "user",
                    description: "The member to ban",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "Reason for the ban",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name:"remautorole",
            description:"Remove the auto role from the server.",
            default_member_permissions: String(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageRoles)
        }

    ]

    const rest = new REST({ version: "10" }).setToken(token);

    (async () => {
        try {
            //   console.log("🔄 Registering global slash commands...");
            await rest.put(Routes.applicationCommands(client_id), { body: commands });
            //   console.log("✅ Slash commands registered globally!");
        } catch (error) {
            console.error("❌ Error registering commands:", error);
        }
    })();

}

module.exports = { registerCommands }