const { REST, Routes, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

const registerCommands = (token, client_id) => {

    const commands = [
        {
            name:"ping",
            description: "Bot Ping.!!"
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