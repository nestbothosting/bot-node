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
            if (!rolePerm.role_id || !Array.isArray(rolePerm.permission)) {
                console.warn(`Invalid role permissions found in PanelData: ${JSON.stringify(rolePerm)}`);
                return null; // Skip invalid entries
            }
            
            return {
                id: rolePerm.role_id,
                allow: rolePerm.permission.map(p => BigInt(p.code)),
            };
        }).filter(Boolean); // Remove null entries

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

module.exports = { CreateChannel, CancelTicket };
