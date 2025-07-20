const TicketModel = require('../../mongodb/model/ticket')
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

const MoveUser = async (channel, user, interaction) => {
    const member = interaction.guild.members.cache.get(user.id);
    await interaction.deferReply({ ephemeral: true });
    if (!member.voice.channel) {
        return interaction.editReply({ content: 'User is not in a voice channel!', ephemeral: true });
    }
    try {
        await member.voice.setChannel(channel);
        await interaction.editReply({ content: `Moved ${user.tag} to ${channel.name}` });
    } catch (error) {
        console.error(error.message);
        await interaction.editReply({ content: 'Failed to move the user.', ephemeral: true });
    }
}

const Mute = async (user, shouldMute, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.guild.members.cache.get(user.id);
    if (!member.voice.channel) {
        return interaction.editReply({ content: 'User is not in a voice channel.', ephemeral: true });
    }
    try {
        await member.voice.setMute(shouldMute);
        return interaction.editReply({ content: `${user.tag} has been ${shouldMute ? 'muted' : 'unmuted'}.`, ephemeral: true });
    } catch (err) {
        console.error(err);
        return interaction.editReplyy({ content: 'Failed to update mute status.', ephemeral: true });
    }
}

const TimeOut = async (member, duration, reason, interaction) => {

    if (!member.moderatable) {
        return interaction.reply({
            content: '❌ I cannot timeout this user.',
            ephemeral: true
        });
    }
    try {
        await member.timeout(duration, reason);

        await interaction.reply({
            content: `✅ ${member.user.tag} has been timed out for <t:${Math.floor((Date.now() + duration) / 1000)}:R>.\n📝 Reason: ${reason}`,
            ephemeral: true
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Failed to timeout the user.',
            ephemeral: true
        });
    }

}

// cmd
const SendTicketPanel = async (interaction) => {
    const serverid = interaction.guildId;

    try {
        const PanelData = await TicketModel.findOne({ server_id: serverid });
        if (!PanelData) {
            return interaction.reply({ content: "❌ Ticket panel not found. create new Panel, Go to ``nestbot.xyz``", ephemeral: true });
        }

        const embed = EmbedBuilder.from(PanelData.embed);

        const createButton = new ButtonBuilder()
            .setCustomId('ticket_create_btn')
            .setLabel('🎫 Create Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(createButton);

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

    } catch (error) {
        console.error("Failed to send ticket panel:", error);
        return interaction.reply({ content: "⚠️ Something went wrong while sending the panel.", ephemeral: true });
    }
};
module.exports = { MoveUser, Mute, TimeOut, SendTicketPanel }