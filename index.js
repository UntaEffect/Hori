const Discord = require('discord.js')
const DisTube = require('distube')
require('dotenv').config();
//const SoundCloudPlugin = require('@distube/soundcloud')
//const SpotifyPlugin = require('@distube/spotify')
const client = new Discord.Client({
	intents: [
		'GUILDS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
	],
})
const { MessageEmbed } = require('discord.js');
const EmbedColor = '#ffae36';
const config = {
	prefix: ',',
	token: process.env.TOKEN,
}

// Create a new DisTube
const distube = new DisTube.default(client, {
	searchSongs: 5,
	searchCooldown: 30,
	leaveOnEmpty: false,
	emptyCooldown: 0,
	leaveOnFinish: false,
	leaveOnStop: false,
	nsfw: true,

	//plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
})

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	client.user.setActivity("Unta <3", ({ type: "LISTENING" }));
	});


client.on('messageCreate', message => {
	if (message.author.bot) return
	if (!message.content.startsWith(config.prefix)) return
	const args = message.content
		.slice(config.prefix.length)
		.trim()
		.split(/ +/g)
	const command = args.shift()

	// Commands >w<
	if (command == "play") {
		if (!args[0]) return message.channel.send(' You must state something to play ');
		if (!message.member.voice.channel) return message.channel.send('You need to join a voice channel first!');
		distube.play(message, args.join(" "));
	}

	if (command == "stop") {
		const bot = message.guild.members.cache.get(client.user.id);
		if (!message.member.voice.channel) return message.channel.send('You need to join a voice channel first!');
		let queue = distube.getQueue(message);
		if (!queue) return message.channel.send('There is nothing playing');
		if (bot.voice.channel !== message.member.voice.channel) return message.channel.send('You are not in the same voice channel as the bot.');
		distube.stop(message);
		message.channel.send('You have stopped the music');
	}

	if (command == "skip") {
		const bot = message.guild.members.cache.get(client.user.id);
		if (!message.member.voice.channel) return message.channel.send('You need to join a voice channel first!');
		let queue = distube.getQueue(message);
		if (!queue) return message.channel.send('There is nothing playing');
		if (bot.voice.channel !== message.member.voice.channel) return message.channel.send('You are not in the same voice channel as the bot.')
		if (!queue.autoplay && queue.songs.length <= 1) return message.channel.send(`Skipped!`) && distube.stop(message);
		distube.skip(message);

		message.channel.send('Skipped');
	}

	if (command == "queue") {
		const queue = distube.getQueue(message);
		if (!queue) return message.channel.send('There is nothing playing');
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id+1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
        ).join("\n"));

	}

	if (command == "help") {
		const help = new MessageEmbed()
			.setColor(EmbedColor)
			.setTitle('Hori Command List')
			.setDescription('`Prefix ,`')
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 4096 }))
			.addFields(
				{ name: 'play', value: 'Plays audio from YouTube', inline: true },
				{ name: 'skip', value: 'Skip the currently playing song', inline: true },
				{ name: 'stop', value: 'Stops the music', inline: true },
				{ name: 'queue', value: 'Show the music queue and now playing.', inline: true },
				{ name: 'uptime', value: 'Check the uptime', inline: true },
				{ name: '\u200B', value: '\u200B' },
				{ name: 'about', value: 'About this bot', inline: true },

			)
		message.channel.send({
			embeds: [help]
		});

	}

	if (command == "about") {
		const about = new MessageEmbed()
			.setColor(EmbedColor)
			.setTitle(client.user.tag)
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 4096 }))
			.addFields(
				{ name: 'Created by :', value: '<@465391282433294337>'},
				{ name: 'Version :', value: 'Beta v1.1'},
				{ name: '\u200B', value: '\u200B' },
				{ name: 'Server :', value: `${client.guilds.cache.size}`},
			)
		message.channel.send({
			embeds: [about]
		});

	}

	if (command == "uptime") {
		let totalSeconds = (client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);

		let uptime = `${days}d, ${hours}h, ${minutes}m and ${seconds}s`;

		const up = new MessageEmbed()
			.setColor(EmbedColor)
			.setTitle('Hori Uptime')
			.setDescription(`${uptime}`)
		message.channel.send({
			embeds: [up]
		});

	}

	if (command == "server") {
		let serverlist = ''
        client.guilds.cache.forEach((guild) => {
            serverlist = serverlist.concat(" - " + guild.name + " | Owner: " + `<@${guild.ownerId}>` + "\n")
        })
		const help = new MessageEmbed()
		.setColor(EmbedColor)
		.setTitle('Server List')
		.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 4096 }))
		.setDescription(`**that have Hori#1072** \n \n ${serverlist}`)
	message.channel.send({
		embeds: [help]
	});
	}

	if (command == "a") {
		if (message.author.id !== '465391282433294337') {
			return
		}

		let text = args.join(' ');
		message.delete();
		message.channel.send(text);
		
	}

});
// Queue status
const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
	|| 'Off'}\` | Loop: \`${queue.repeatMode
		? queue.repeatMode === 2
			? 'All Queue'
			: 'This Song'
		: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``

// DisTube event listeners
distube
	.on('playSong', (queue, song) =>
		queue.textChannel.send(
			`Playing \`${song.name}\` - \`${song.formattedDuration
			}\`\nRequested by: ${song.user}\n${status(queue)}`,
		))
	.on('addSong', (queue, song) =>
		queue.textChannel.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		))
	.on('addList', (queue, playlist) =>
		queue.textChannel.send(
			`Added \`${playlist.name}\` playlist (${playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		))
	// DisTubeOptions.searchSongs = true
	.on('searchResult', (message, result) => {
		let i = 0
			const search1 = new MessageEmbed()
			.setColor(EmbedColor)
			.setTitle('Choose an option from below')
			.setDescription(`${result
                .map(
                    song =>
                        `**${++i}**. ${song.name} - \`${song.formattedDuration
                        }\``,
                )
                .join(
                    '\n',
                )}\n\n**Enter anything else or wait 30 seconds to cancel**`)
	
				message.channel.send({
					embeds: [search1]

				}).then(msg => {
					setTimeout(() => msg.delete(), 30000)
			})
	})
	// DisTubeOptions.searchSongs = true
	.on('searchDone', () => {})
	.on('searchCancel', message => message.channel.send(`Searching canceled`))
	.on('searchInvalidAnswer', message =>
		message.channel.send(`You answered an invalid number!`).then(msg => {
			setTimeout(() => msg.delete(), 	6000) }))
	.on('searchNoResult', message => message.channel.send(`No result found!`))
	.on("error", (channel, error) => channel.send(
		"An error encountered: " + error
	))
	.on('finish', queue => queue.textChannel.send('Finish queue!'))
	.on('finishSong', queue => queue.textChannel.send('Finish song!'))
	.on('disconnect', queue => queue.textChannel.send('Disconnected!'))
	.on('empty', queue => queue.textChannel.send('Empty!'))
client.login(config.token)