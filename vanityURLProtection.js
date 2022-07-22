module.exports = async (client, guild) => {
    const fetchLogs = await guild.fetchAuditLogs({ type: 'GUILD_UPDATE' }).catch(() => { });
    const entrie = fetchLogs?.entries?.first();

    async function setVanityURL(code, reason) {
        return client.api.guilds(guild.id, 'vanity-url')
            .patch({ data: { code: code }, reason })
            .then((newData) => {
                client.actions.GuildUpdate.handle(newData);
                return newData.code;
            });
    }

    entrie.changes.map(data => {
        const vanityURL = 'url here';

        if (data.key === 'vanity_url_code' && data?.new !== vanityURL) {
            setVanityURL(vanityURL).catch(() => { });

            const member = guild.members.cache.get(entrie.executor.id);
            if (!member) return;

            const filteredRoles = member.roles.cache.filter(roles => roles.permissions.has('MANAGE_GUILD'));
            if (!filteredRoles) return;

           member.roles.remove(filteredRoles.map(roles => roles.id)).catch(() => { });
        }
    });
}
