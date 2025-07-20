const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../../mongodb/model/ticket');

const CreateChannel = async (interaction) => {
    try {
        const guild = interaction.guild;
        if (!guild) {
            return await interaction.reply({ content: 'This command can only be used inside a server.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });

        const server_id = guild.id;
        const PanelData = await TicketModel.findOne({ server_id: server_id });

        if (!PanelData) {
            return await interaction.followUp({ content: `Ticket Panel not found`, ephemeral: true });
        }

        if (!PanelData.permissions || !Array.isArray(PanelData.permissions)) {
            return await interaction.followUp({ content: `Ticket Panel permissions are invalid.`, ephemeral: true });
        }

        // Build permission overwrites from PanelData
        const permissionOverwrites = PanelData.permissions.map(rolePerm => {
            if (!rolePerm.id) {
                console.warn(`Invalid role permissions found in PanelData: ${JSON.stringify(rolePerm)}`);
                return null; 
            }

            return {
                id: rolePerm.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
            };
        })

        // Allow the interaction user to view the channel
        permissionOverwrites.push({
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        });

        // Deny @everyone from viewing the channel
        permissionOverwrites.push({
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        });

        // Create the ticket channel
        const channel = await guild.channels.create({
            name: `ticket-${interaction.user.username}-${PanelData._id.toString().slice(-4)}`, // Shorten the id for cleaner names
            type: ChannelType.GuildText,
            permissionOverwrites: permissionOverwrites,
        });

        // Build the Cancel Button
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_ticket')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(cancelButton);

        // Send message in the ticket channel
        await channel.send({
            content: `Hello ${interaction.user}, welcome to your ticket!`,
            components: [row],
        });

        // Inform user
        await interaction.followUp({ content: `Ticket created: <#${channel.id}>`, ephemeral: true });

    } catch (error) {
        console.error('Error creating ticket channel:', error);
        try {
            await interaction.followUp({ content: `Something went wrong creating the ticket.`, ephemeral: true });
        } catch (followUpError) {
            console.error('Error sending follow-up message:', followUpError);
        }
    }
}

const CancelTicket = async (interaction) => {
    try {
        const channel = interaction.channel;
        const user = interaction.user;

        // You can check if the channel name starts with "ticket-" just to be safe
        if (!channel.name.startsWith('ticket-')) {
            return await interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
        }

        await interaction.reply({ content: 'Ticket will be deleted in 3 seconds...', ephemeral: true });

        setTimeout(async () => {
            await channel.delete().catch(err => console.error('Failed to delete ticket channel:', err));
        }, 3000); // 3 seconds delay before deleting

    } catch (error) {
        console.error('Error in CancelTicket:', error);
        try {
            await interaction.reply({ content: 'Something went wrong while cancelling the ticket.', ephemeral: true });
        } catch (err) {
            console.error('Error sending error message:', err);
        }
    }
};

const UserInfo = async (interaction, user, memberObj) => {
    const embed = {
        color: 0x00bfff,
        title: `User Info: ${user.username}`,
        thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
        fields: [
            { name: "Username", value: user.tag, inline: true },
            { name: "User ID", value: user.id, inline: true },
            {
                name: "Account Created",
                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                inline: false,
            },
        ],
        timestamp: new Date(),
    };

    if (memberObj) {
        embed.fields.push({
            name: "Joined Server",
            value: `<t:${Math.floor(memberObj.joinedTimestamp / 1000)}:F>`,
            inline: false,
        });
    }

    await interaction.reply({ embeds: [embed] });
};

const ServerInfo = async (guild, owner, interaction) => {
    const embed = {
        color: 0x00bfff,
        title: `Server Info: ${guild.name}`,
        thumbnail: {
            url: guild.iconURL({ dynamic: true }),
        },
        fields: [
            { name: "Server Name", value: guild.name, inline: true },
            { name: "Server ID", value: guild.id, inline: true },
            { name: "Owner", value: `${owner.user.tag} (${owner.id})`, inline: false },
            { name: "Members", value: `${guild.memberCount}`, inline: true },
            { name: "Boosts", value: `${guild.premiumSubscriptionCount}`, inline: true },
            {
                name: "Created On",
                value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                inline: false
            },
            { name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
        ],
        footer: {
            text: `Requested by ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        },
        timestamp: new Date(),
    };

    await interaction.reply({ embeds: [embed] });
}

const ClearMessage = async (interaction, amount) => {
    try {
        // Deleting the messages
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({
            content: `✅ Deleted ${deleted.size} messages.`,
            ephemeral: true,
        });
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "❌ Failed to delete messages. Make sure they are not older than 14 days.",
            ephemeral: true,
        });
    }
}

const Kick = async (user, reason, interaction) => {
    if (!interaction.guild) {
        return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
        return interaction.reply({ content: "❌ Member not found in this server.", ephemeral: true });
    }

    if (!member.kickable) {
        return interaction.reply({ content: "❌ I can't kick this user. Do they have a higher role than me?", ephemeral: true });
    }

    try {
        await member.kick(reason);
        await interaction.reply(`✅ Kicked ${user.tag} for: **${reason}**`);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Failed to kick the user.", ephemeral: true });
    }
}

const Ban = async (user, reason, interaction) => {

    if (!interaction.guild) {
        return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
        return interaction.reply({ content: "❌ Member not found in this server.", ephemeral: true });
    }

    if (!member.bannable) {
        return interaction.reply({ content: "❌ I can't ban this user. They might have a higher role or be the server owner.", ephemeral: true });
    }

    try {
        await member.ban({ reason });
        await interaction.reply(`✅ Banned ${user.tag} for: **${reason}**`);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Failed to ban the user.", ephemeral: true });
    }
}

module.exports = { CreateChannel, CancelTicket, UserInfo, ServerInfo, ClearMessage, Kick, Ban };
