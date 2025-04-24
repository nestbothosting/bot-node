const interactionCreate = (client) => {
     client.on("interactionCreate", async (interaction) => {
          try {
               if (interaction.isChatInputCommand()) {
                    if (interaction.commandName === "ping") {
                         return await interaction.reply("🏓 Pong!");
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
