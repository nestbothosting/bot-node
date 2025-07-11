const AddRoleModel = require('../mongodb/model/autoroleadd');
const { SaveBotLog } = require('./botlog');


const SetAutoRole = async (server_id, role_id, bot_id) => {
    try {
        const existing = await AddRoleModel.findOne({ server_id });

        if (existing) {
            return { status: false, message: "Auto-role already set for this server. Remove auto-role by running `/remautorole` on the server." };
        }

        const newRole = new AddRoleModel({ role_id, server_id });
        await newRole.save();

        SaveBotLog(bot_id, `Set Auto Role Add system. Role id:${role_id}, server id:${server_id}`, 'AutoRoleAdd')

        return { status: true, message: "Auto-role set successfully." };
    } catch (error) {
        console.error("SetAutoRole error:", error.message);
        return { status: false, message: "Failed to set auto-role." };
    }
};


const CheckRoleForAdd = async (member) => {
    const roledata = await AddRoleModel.findOne({ server_id: member.guild.id })
    if (!roledata) return;

    const role = member.guild.roles.cache.get(roledata.role_id);

    try {
        await member.roles.add(role);
        console.log(`🎉 Role ${role.name} assigned to ${member.user.tag}`);
    } catch (error) {
        console.error("❌ Error assigning role:", error.message);
    }
}

const RemoveAutoRoleAdd = async (interaction) => {
    try {
        const serverId = interaction.guild.id;
        const deleted = await AddRoleModel.findOneAndDelete({ server_id: serverId });
        if (!deleted) {
            return interaction.reply({ content: '❌ No auto-role was set for this server. Go to [nestbot.xyz/dashboard/autoroleadd](https://nestbot.xyz/dashboard/autoroleadd) and add a new one.', ephemeral: true });
        }
        return interaction.reply({ content: '✅ Auto-role has been removed successfully.', ephemeral: true });
    } catch (error) {
        console.error(error.message);
        return interaction.reply({ content: '❌ Failed to remove auto-role. Try again later.', ephemeral: true });
    }
}

module.exports = { CheckRoleForAdd, SetAutoRole, RemoveAutoRoleAdd }