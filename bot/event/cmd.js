const TicketModel = require('../../mongodb/model/ticket')
const WarnModel = require('../../mongodb/model/warn')
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

// warn a user
const WarnUser = async (user, reason, interaction) => {
    const MAX_WARNS = 23;

    if (!user) {
        return interaction.reply({ content: '⚠️ Please select a user.', ephemeral: true });
    }

    try {
        let UserData = await WarnModel.findOne({ userid: user.id, guildId: interaction.guild.id });

        if (!UserData) {
            // create a new warn entry
            const NewModel = new WarnModel({
                guildId: interaction.guild.id,
                userid: user.id,
                warnings: [
                    {
                        moderatorid: interaction.user.id,
                        reason: reason || "No reason provided"
                    }
                ]
            });

            await NewModel.save();

            await interaction.reply({
                content: `<@${user.id}> has been warned! 📌 Reason: ${reason || "No reason provided"}`
            });

            return; // stop here
        }

        // if max warns reached
        if (UserData.warnings.length >= MAX_WARNS) {
            await interaction.reply({
                content: `<@${user.id}> has been warned again! 📌 Reason: ${reason || "No reason provided"}`
            });

            return interaction.followUp({
                content: `⚠️ <@${user.id}> has now reached the **maximum warning limit (${MAX_WARNS})**!`
            });
        }

        // add a warning
        UserData.warnings.push({
            moderatorid: interaction.user.id,
            reason: reason || "No reason provided"
        });

        await UserData.save();

        await interaction.reply({
            content: `<@${user.id}> has been warned! 📌 Reason: ${reason || "No reason provided"}`
        });

        // optional extra message
        await interaction.followUp({
            content: `⚠️ They now have **${UserData.warnings.length}/${MAX_WARNS} warnings**.`
        });

    } catch (error) {
        console.error(error);
        if (interaction.replied) {
            await interaction.followUp({ content: `⚠️ Oops, Warn Error: ${error.message}`, ephemeral: true });
        } else {
            await interaction.reply({ content: `⚠️ Oops, Warn Error: ${error.message}`, ephemeral: true });
        }
    }
};

// Get a User Warn List
const UserWarnList = async (user, interaction) => {
    try {
        const WarnList = await WarnModel.findOne({
            userid: user.id,
            guildId: interaction.guild.id,
        });

        if (!WarnList || WarnList.warnings.length === 0) {
            const NoWarnEmbed = new EmbedBuilder()
                .setTitle(`${user.username}'s Warnings`)
                .setDescription("✅ This user has **0 warnings**.")
                .setColor("Green");
            return interaction.reply({ embeds: [NoWarnEmbed], ephemeral: true });
        }

        // If warnings exist
        const WarnEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s Warnings (${WarnList.warnings.length})`)
            .setColor("Red");

        for (let i = 0; i < WarnList.warnings.length; i++) {
            const warn = WarnList.warnings[i];
            const unixTimestamp = Math.floor(warn.date / 1000);

            WarnEmbed.addFields({
                name: `⚠️ Warning #${i + 1}`,
                value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderatorid}>\n**Date:** <t:${unixTimestamp}:R>`,
                inline: false,
            });
        }

        return interaction.reply({ embeds: [WarnEmbed] });

    } catch (error) {
        console.error(error);
        return interaction.reply({
            content: "❌ An error occurred while fetching warnings.",
            ephemeral: true,
        });
    }
};

const RemoveUserWarns = async (user, interaction) => {
    try {
        const Warns = await WarnModel.exists({ userid: user.id, guildId: interaction.guild.id })
        if (!Warns) {
            const noWarns = new EmbedBuilder()
                .setTitle(`No Warnings. ${user.username}`)
                .setColor('Yellow')
                .setTimestamp()

            return await interaction.reply({ embeds: [noWarns] })
        }
        // deleting Warns
        await WarnModel.findOneAndDelete({ userid: user.id, guildId: interaction.guild.id })
        const inWarns = new EmbedBuilder()
            .setTitle(`Deleted warnings for ${user.username}`)
            .setColor('Green')
            .setTimestamp()

        await interaction.reply({ embeds: [inWarns] });
    } catch (error) {
        await interaction.reply({ content: `oops! Error: ${error.message}`, ephemeral: true });
    }
}


module.exports = { MoveUser, Mute, TimeOut, SendTicketPanel, WarnUser, UserWarnList, RemoveUserWarns }