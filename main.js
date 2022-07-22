const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });

client.on('ready', async () => {
    console.log(`Estou online! ${client.user.username}`);
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
    const fetchLogs = await oldGuild.fetchAuditLogs({ type: 'GUILD_UPDATE' }).catch(() => { });
    const entrie = fetchLogs?.entries?.first();

    async function setVanityURL(code, reason) {
        return client.api.guilds(oldGuild.id, 'vanity-url')
            .patch({ data: { code: code }, reason })
            .then((newData) => {
                client.actions.GuildUpdate.handle(newData);
                return newData.code;
            });
    }

    entrie.changes.map(data => {
        const vanityURL = 'url';

        if (data.key === 'vanity_url_code' && data?.new !== vanityURL) {
            setVanityURL(vanityURL);

            const member = oldGuild.members.cache.get(entrie.executor.id);
            if (!member) return;

            const rolesWithAdmin = member.roles.cache.filter(roles => roles.permissions.has('ADMINISTRATOR'));
            if (!rolesWithAdmin) return;

            member.roles.remove(rolesWithAdmin.map(roles => roles.id)).catch(() => { });
        }
    });
});

client.login("token here");
