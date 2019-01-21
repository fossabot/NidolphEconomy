const Discord = require(`discord.js`);
const client = new Discord.Client();
const fs = require("fs");

let points = JSON.parse(fs.readFileSync("./points.json", "utf8"));
let cmds = JSON.parse(fs.readFileSync("./backup.json", "utf8"));
let bank = JSON.parse(fs.readFileSync("./banks.json", "utf8"));

var botowner = "ваш id аккаунта";
var token = "токен вашего бота";
var gid = 'ваш id гильдии';
const cooldown1 = new Set();
const cooldown2 = new Set();

client.on('message', async message => {
  if(message.guild.id !== gid) return;
  if(message.author.bot) return;
	if (!points[message.author.id]) points[message.author.id] = {
    points: 0,
    coins: 0,
    level: 0,
    access: 1
  };
  let userData = points[message.author.id];
  userData.points++;

  while (userData.points >= (userData.level + 1) * 150) {
    userData.level++;
    let embedmsg = new Discord.RichEmbed()
      .setAuthor(`Уровень повышен!`, client.user.avatarURL)
      .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
    message.channel.send(embedmsg);
  }

  fs.writeFile("./points.json", JSON.stringify(points), (err) => {
    if (err) console.error(err)
  });

  fs.writeFile("./backup.json", JSON.stringify(cmds), (err) => {
    if (err) console.error(err)
  });

  fs.writeFile("./banks.json", JSON.stringify(bank), (err) => {
    if (err) console.error(err)
  });

  const ayy = client.emojis.find("name", "immaPutinHer");
  if(!message.content.startsWith("!")) return;
  const args = message.content.slice("!".length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

    if(command === "bank" || command === "банк") {
      if(!message.guild) return;
      if(cmds["bank"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      if(!args[0] || args[0] === "") {
        message.channel.send(`Команды:\n\n\`\`\`!${command} info - информация о счёте\n!${command} withdraw <кол-во коинов> - взять коины из счёта\n!${command} deposit <кол-во коинов> - положить коины на счёт\n!${command} create - создать счёт в банке (цена: 2000 коинов)\n\`\`\``);
      }

      if(args[0] === "info") {
        if(bank[message.author.id].active < "1") return "Активен";
        let embedmsg = new Discord.RichEmbed()
          .addField(`Статус счёта`, bank[message.author.id].active)
          .addField(`Количество монет`, bank[message.author.id].coins)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(embedmsg);
      }
      if(args[0] === "create") {
        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("2000")

        if(x1 < y) return message.channel.send(`:x: || Недостаточно коинов для создания`);
        if(!bank[message.author.id]) {

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          }

          bank[message.author.id] = {
            active: 1,
            coins: 0
          };

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Вы успешно создали счёт в банке!`);
        } else {
          return message.channel.send(`:x: || У Вас уже есть счёт в банке!`);
        }
      }
      if(args[0] === "deposit") {
        if(!args[1]) return message.channel.send(`:x: || Не указано кол-во коинов для списания.`);
        args[1] = args[1].replace(/[\.,\-]/g, '');
      if (isNaN(+args[1])) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Указано некорректное кол-во коинов.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(`Указано некорректное кол-во коинов.`);
      }

          if(points[message.author.id].coins < args[1]) {
            message.channel.send(`:x: || Недостаточно коинов для списания.`);
          } else {
            points[message.author.id] = {
              points: points[message.author.id].points,
              coins: parseInt(points[message.author.id].coins) - parseInt(args[1]),
              level: points[message.author.id].level,
              access: points[message.author.id].access
            }
            bank[message.author.id] = {
              active: bank[message.author.id].active,
              coins: parseInt(bank[message.author.id].coins) + parseInt(args[1])
            }

            message.author.send(`:warning: || С вашего кошелька списано монет: ${args[1]}`);
            return message.channel.send(`:white_check_mark: || Вы положили деньги на свой счёт в банке!`);
          }
      }
      if(args[0] === "withdraw") {
        if(!args[1]) return message.channel.send(`:x: || Не указано кол-во коинов для списания.`);
        args[1] = args[1].replace(/[\.,\-]/g, '');
      if (isNaN(+args[1])) return message.channel.send(`Указано некорректное кол-во коинов.`);

          if(bank[message.author.id].coins < args[1]) {
            message.channel.send(`:x: || Недостаточно коинов для списания.`);
          } else {
            bank[message.author.id] = {
              active: bank[message.author.id].active,
              coins: parseInt(bank[message.author.id].coins) - parseInt(args[1])
            }
            points[message.author.id] = {
              points: points[message.author.id].points,
              coins: parseInt(points[message.author.id].coins) + parseInt(args[1]),
              level: points[message.author.id].level,
              access: points[message.author.id].access
            }

            message.author.send(`:white_check_mark: || На ваш кошелёк зачисленно монет: ${args[1]}`);
            return message.channel.send(`:white_check_mark: || Вы взяли деньги со своего счёта в банке!`);
          }
      }
    }

    if(command === "profile" || command === "профиль") {
      if (!message.guild) return; // Чтобы не было ошибки при использовании команды вне сервера
      if(cmds["profile"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
      if(!member) {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }
        let embedmsg = new Discord.RichEmbed()
          .addField(`Корректный уровень`, points[message.author.id].level)
          .addField(`Количество монет`, points[message.author.id].coins)
          .addField(`Уровень доступа`, `${points[message.author.id].access}`)
          .setThumbnail(message.author.avatarURL)
          .setFooter(`Запрос от ${message.author.tag}`) // okk
          .setTimestamp();
        message.channel.send(embedmsg);
      } else {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }
        let embedmsg = new Discord.RichEmbed()
          .addField(`Корректный уровень`, points[member.user.id].level)
          .addField(`Количество монет`, points[member.user.id].coins)
          .addField(`Уровень доступа`, `${points[member.user.id].access}`)
          .setThumbnail(member.user.avatarURL)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        message.channel.send(embedmsg);
      }
    }

    if(command === "admin") {
      if (!message.guild) return; // Во избежании ошибки
      if(userData.access < "3") return message.channel.send(ayy + ` || Недостаточно прав.`);
      if(!args[0] || args[0] === "") {
        message.channel.send(`Данная команда работает ТОЛЬКО на тех, у кого 3 уровень доступа.\n\n!${command} setaccess <@пользователь/ID> <уровень доступа> - выдать спец. права\n!${command} managecmd <название команды> <режим> - установить работоспособность команды`);
      }
      if(args[0] === "managecmd") {
      	let cmdfor = args[1];
        if(!cmdfor) return message.channel.send('Непредвиденная ошибка: команда не указана')
        if(!args[2]) return message.channel.send('Непредвиденная ошибка: режим не указан')
        	if(args[2] === "on") {
        		cmds[cmdfor] = {
        	    	work: 1,
        	    	test: 0
        	  	}

        	  	return message.channel.send(`:white_check_mark: || Успешно изменён режим команды **${args[1]}** на **включён**`);
        	}
        	if(args[2] === "off") {
        		cmds[cmdfor] = {
        	    	work: 0,
        	    	test: 0
        	  	}

        	  	return message.channel.send(`:white_check_mark: || Успешно изменён режим команды **${args[1]}** на **отключён**`);
        	}
        	if(args[2] === "mt") {
        		cmds[cmdfor] = {
        	    	work: 0,
        	    	test: 1
        	  	}

        	  	return message.channel.send(`:white_check_mark: || Успешно изменён режим команды **${args[1]}** на **тех. работы**`);
        	}
        }
      if(args[0] === "setaccess") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]) || message.guild.members.get(message.author.id));
        if(!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден')
        if(!args[2]) return message.channel.send('Непредвиденная ошибка: уровень доступа не указан')

        points[member.id] = {
          points: points[member.id].points,
          coins: points[member.id].coins,
          level: points[member.id].level,
          access: args[2]
        };

        return message.channel.send(`:white_check_mark: || Уровень доступа успешно установлен пользователю ${member}`);
      }
    }

    if(command === 'eco') {
      if (!message.guild) return; // Во избежании ошибки
      if(cmds["eco"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      if(userData.access < "2") return message.channel.send(ayy + ` || Недостаточно прав.`);
      if (!args[0]) {
        message.channel.send(`Данная команда управляет модулем Economy. Доступные команды:\`\`\`\n!${command} cdreset <@пользователь/ID> - сбросить кулдаун пользователю\n!${command} coingive <@пользователь/ID> <кол-во коинов> - выдать коины пользователю\n!${command} coinset <@пользователь/ID> <кол-во коинов> - установить кол-во коинов у пользователя\n!${command} coinrm <@пользователь/ID> <кол-во коинов> - удалить у пользователя коины\n!${command} reset <@пользователь/ID> - сбросить статистику пользователя\`\`\`Примечание: Данная команда работает ТОЛЬКО на тех, у кого 2 и 3 уровень доступа.`);
      }
      if(args[0] === "cdreset") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]) || message.guild.members.get(message.author.id));
        if (!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден') // Непредвиденная, т.к. я добавил кое-что в member, а именно:

        cooldown1.delete(member.id);
        cooldown2.delete(member.id);
        return message.channel.send(`:white_check_mark: || Сброшен кулдаун для пользователя ${member} (\`${member.id}\`).`); // Готово
      }
      if(args[0] === "coingive") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
        if (!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден');
        if(!args[2]) return message.channel.send('Непредвиденная ошибка: не указано кол-во коинов')
        if(args[2]) points[member.id] = {
          points: points[member.id].points,
          coins: parseInt(points[member.id].coins) + parseInt(args[2]),
          level: points[member.id].level,
          access: points[member.id].access
        };

        member.send(`:white_check_mark: || На ваш кошелёк зачисленно монет: ${args[2]}`);
        return message.channel.send(`:white_check_mark: || Успешно выдано монет: ${args[2]}`);
      }
      if(args[0] === "coinset") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
        if (!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден');
        if(!args[2]) return message.channel.send('Непредвиденная ошибка: не указано кол-во коинов')
        if(args[2]) points[member.id] = {
          points: points[member.id].points,
          coins: parseInt(args[2]),
          level: points[member.id].level,
          access: points[member.id].access
        };

        member.send(`:warning: || Счёт вашего кошелька был установлен администратором.\nТеперь у вас в кошельке монет: ${args[2]}`);
        return message.channel.send(`:white_check_mark: || Успешно установлено монет: ${args[2]}`);
      }
      if(args[0] === "coinrm") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
        if (!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден');
        if(!args[2]) return message.channel.send('Непредвиденная ошибка: не указано кол-во коинов')
        if(args[2]) points[member.id] = {
          points: points[member.id].points,
          coins: parseInt(points[member.id].coins) - parseInt(args[2]),
          level: points[member.id].level,
          access: points[member.id].access
        };

        member.send(`:warning: || С вашего кошелька списано монет: ${args[2]}`);
        return message.channel.send(`:white_check_mark: || Успешно удалено монет: ${args[2]}`);
      }
      if(args[0] === "reset") {
        let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
        if (!member) return message.channel.send('Непредвиденная ошибка: пользователь не найден');
        if(member) {
          message.channel.send('Вы действительно хотите сбросить статистику пользователю ' + member + '?\nВНИМАНИЕ! ЭТО ДЕЙСТВИЕ НЕОБРАТИМО!\nДля подтверждения, отправьте сообщение с текстом `yes` в течении 30 секунд.')
          .then(() => {
            message.channel.awaitMessages(response => response.content === 'yes', {
              max: 1,
              time: 30000,
              errors: ['time'],
          })
            .then((collected) => {
              if(userData.access < "2") {
                let errormsg = new Discord.RichEmbed()
                  .setDescription(ayy + ` Вы не разработчик бота. Действие отменено.`)
                  .setTimestamp();
                return message.channel.send(errormsg);
              } else {
                points[member.id] = {
                  points: 0,
                  coins: 0,
                  level: 0,
                  access: 1
                };

                member.send(`:x: || Ваш аккаунт был обнулён.`);
                return message.channel.send(`:white_check_mark: || Успешно сброшена статистика пользователя ${member}`);
              }
            })
            .catch(() => {
              message.channel.send(':x: || Вы не успели. Повторите действие, прописав команду снова.');
            });
          });
        }
      }
    };

    if(command === "daily" || command === "дэйли") {
      if(!message.guild) return;
      if(cmds["daily"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      if(cooldown1.has(message.author.id)) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Вы уже получили ежедневный бонус! (1 раз в 24 часа)`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      } else {

        points[message.author.id] = {
          points: userData.points,
          coins: parseInt(userData.coins) + parseInt(500),
          level: userData.level,
          access: userData.access
        };

        let embedmsg = new Discord.RichEmbed()
          .setDescription(`Вы получили ежедневный бонус!`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        message.author.send(`:white_check_mark: || На ваш кошелёк зачисленно монет: ${parseInt(500)}`);
        message.channel.send(embedmsg);

        cooldown1.add(message.author.id);
        setTimeout(() => {
          cooldown1.delete(message.author.id);
        }, 86400000); // 24 часа
      }
    }

    if(command === "work" || command === "работа") {
      if(!message.guild) return;
      if(cmds["work"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      if(cooldown2.has(message.author.id)) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Вы уже заработали на работе! (1 раз в 30 минут)`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      } else {

        let min = 1;
        let max = 1000;
        let rand = Math.floor(Math.random() * (max - min)) + min;

        points[message.author.id] = {
          points: userData.points,
          coins: userData.coins + rand,
          level: userData.level,
          access: userData.access
        };

        let embedmsg = new Discord.RichEmbed()
          .setDescription(`Вы заработали монет: ${rand.toLocaleString()}`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();

        message.author.send(`:white_check_mark: || На ваш кошелёк зачисленно монет: ${rand.toLocaleString()}`);
        message.channel.send(embedmsg);

        cooldown2.add(message.author.id);
        setTimeout(() => {
          cooldown2.delete(message.author.id);
        }, 1800000); // 30 минут
      }
    }

    if(command === "buy" || command === "купить") {
      if(!message.guild) return;
      if(cmds["buy"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      if(!args[0] || args[0] === "") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }
        message.channel.send(`:warning: || Вся информация о том, как и что купить, есть в канале **<#533162848453525505>**`);
      }
      args[0] = args[0].replace(/[\.,\-]/g, '');
      if (isNaN(+args[0])) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Указан некорректный ID товара.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      }
      if(args[0] === "1") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("1000");

        if (x1 < y) {
          let errormsg = new Discord.RichEmbed()
            .setDescription(`Недостаточно коинов для покупки товара.`)
            .setFooter(`Запрос от ${message.author.tag}`)
            .setTimestamp();
          return message.channel.send(errormsg);
        } else {
          while (userData.points >= (userData.level + 1) * 150) {
            userData.level++;
            let embedmsg = new Discord.RichEmbed()
              .setAuthor(`Уровень повышен!`, client.user.avatarURL)
              .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
            message.channel.send(embedmsg);
          }

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          };

          let role = message.guild.roles.get("533163183657975808");
          message.member.addRole(role.id);

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Покупка совершена.`);
        }
      }
      if(args[0] === "2") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("1000");

        if (x1 < y) {
          let errormsg = new Discord.RichEmbed()
            .setDescription(`Недостаточно коинов для покупки товара.`)
            .setFooter(`Запрос от ${message.author.tag}`)
            .setTimestamp();
          return message.channel.send(errormsg);
        } else {
          while (userData.points >= (userData.level + 1) * 150) {
            userData.level++;
            let embedmsg = new Discord.RichEmbed()
              .setAuthor(`Уровень повышен!`, client.user.avatarURL)
              .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
            message.channel.send(embedmsg);
          }

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          };

          let role = message.guild.roles.get("533163345055055896");
          message.member.addRole(role.id);

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Покупка совершена.`);
        }
      }
      if(args[0] === "3") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("1000");

        if (x1 < y) {
          let errormsg = new Discord.RichEmbed()
            .setDescription(`Недостаточно коинов для покупки товара.`)
            .setFooter(`Запрос от ${message.author.tag}`)
            .setTimestamp();
          return message.channel.send(errormsg);
        } else {
          while (userData.points >= (userData.level + 1) * 150) {
            userData.level++;
            let embedmsg = new Discord.RichEmbed()
              .setAuthor(`Уровень повышен!`, client.user.avatarURL)
              .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
            message.channel.send(embedmsg);
          }

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          };

          let role = message.guild.roles.get("533163262296981525");
          message.member.addRole(role.id);

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Покупка совершена.`);
        }
      }
      if(args[0] === "4") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("1000");

        if (x1 < y) {
          let errormsg = new Discord.RichEmbed()
            .setDescription(`Недостаточно коинов для покупки товара.`)
            .setFooter(`Запрос от ${message.author.tag}`)
            .setTimestamp();
          return message.channel.send(errormsg);
        } else {
          while (userData.points >= (userData.level + 1) * 150) {
            userData.level++;
            let embedmsg = new Discord.RichEmbed()
              .setAuthor(`Уровень повышен!`, client.user.avatarURL)
              .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
            message.channel.send(embedmsg);
          }

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          };

          let role = message.guild.roles.get("533163547262189618");
          message.member.addRole(role.id);

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Покупка совершена.`);
        }
      }
      if(args[0] === "5") {
        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        x1 = parseInt(points[message.author.id].coins)
        y = parseInt("1000");

        if (x1 < y) {
          let errormsg = new Discord.RichEmbed()
            .setDescription(`Недостаточно коинов для покупки товара.`)
            .setFooter(`Запрос от ${message.author.tag}`)
            .setTimestamp();
          return message.channel.send(errormsg);
        } else {
          while (userData.points >= (userData.level + 1) * 150) {
            userData.level++;
            let embedmsg = new Discord.RichEmbed()
              .setAuthor(`Уровень повышен!`, client.user.avatarURL)
              .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
            message.channel.send(embedmsg);
          }

          points[message.author.id] = {
            points: points[message.author.id].points,
            coins: x1 - y,
            level: points[message.author.id].level,
            access: points[message.author.id].access
          };

          let role = message.guild.roles.get("533163591793246210");
          message.member.addRole(role.id);

          message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
          return message.channel.send(`:white_check_mark: || Покупка совершена.`);
        }
      }
    }

    if(command === "transfer" || command === "передача") {
      if (!message.guild) return; // Чтобы не было ошибки при использовании команды вне сервера
      if(cmds["transfer"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      let member = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
      if(!member) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Пользователь/ID пользователя не указан.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      }
      if(!args[1]) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Кол-во коинов не указано.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      }
      args[1] = args[1].replace(/[\.,\-]/g, '');
      if (isNaN(+args[1])) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Указано некорректное кол-во коинов.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      }

      x1 = parseInt(points[message.author.id].coins)
      x2 = parseInt(points[member.user.id].coins)
      y = parseInt(args[1]);

      if (x1 < y) {
        let errormsg = new Discord.RichEmbed()
          .setDescription(`Недостаточно коинов для передачи.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        return message.channel.send(errormsg);
      }

      if(member || coinsfortransfer) {
        points[message.author.id] = {
          points: points[message.author.id].points,
          coins: x1 - y,
          level: points[message.author.id].level,
          access: points[message.author.id].access
        };

        points[member.user.id] = {
          points: points[member.id].points,
          coins: x2 + y,
          level: points[member.id].level,
          access: points[member.id].access
        };

        while (userData.points >= (userData.level + 1) * 150) {
          userData.level++;
          let embedmsg = new Discord.RichEmbed()
            .setAuthor(`Уровень повышен!`, client.user.avatarURL)
            .setDescription(`Поздравляю, ${message.author}! Вы повысили свой уровень до **${userData.level}**!`);
          message.channel.send(embedmsg);
        }

        let embedmsg = new Discord.RichEmbed()
          .setDescription(`Передача завершена.`)
          .setFooter(`Запрос от ${message.author.tag}`)
          .setTimestamp();
        message.author.send(`:warning: || С вашего кошелька списано монет: ${y}`);
        member.send(`:white_check_mark: || На ваш кошелёк зачисленно монет: ${y}`);
        message.channel.send(embedmsg);
      }
    }

    if (command === 'flip') {
      let dollar = ':dollar:';
      if (!message.guild) return;
      if(cmds["flip"].work < 1) return message.channel.send(`:x: || Команда отключена. Сожалеем что принесли вам неудобства. :c`);
      let embed = new Discord.RichEmbed();
      let syntaxisEmbed = new Discord.RichEmbed()
        .setFooter(message.author.tag, message.author.displayAvatarURL)
        .addField(`Синтаксис команды`, `\`${command} [орел | решка] <сумма / all>\` `);
      syntaxisEmbed.setDescription(` Указан некорректный аргумент \`[орел | решка]\``);
      let variant;
      if (!args[0]) return message.channel.send(syntaxisEmbed);
      if (args[0].toLowerCase().startsWith(`о`) || args[0].toLowerCase().startsWith(`h`)) variant = `heads`;
      if (args[0].toLowerCase().startsWith(`р`) || args[0].toLowerCase().startsWith(`t`)) variant = `tails`;
      if (!variant) return message.channel.send(syntaxisEmbed);
      if (args[1]) args[1] = args[1].replace(/[\.,\-]/g, '');
      let sum = args[1];
      if (sum === 'all') {
        embed.setDescription(`**Ваш** кошелек пуст`)
        if (points[message.author.id].coins === 0) return message.channel.send(embed);
        embed.setDescription(`Минимальная ставка - **${dollar}${100}**`);
        if (points[message.author.id].coins < 100) return message.channel.send(embed);
        sum = points[message.author.id].coins;
      } else if (points[message.author.id].coins < parseInt(sum)) {
        embed.setDescription(`Недостаточно средств в кошельке`);
        return message.channel.send(embed);
      };
      sum = parseInt(sum);
      embed.setDescription(`Минимальная ставка - **${dollar}${100}**`);
      if (points[message.author.id].coins < 100) return message.channel.send(embed);
      syntaxisEmbed.setDescription(`Указан некорректный аргумент \`<сумма / all>\` `);
      if (isNaN(sum)) return message.channel.send(syntaxisEmbed);
      let rand = Math.floor(Math.random() * 99) + 1;
      let winner = rand > 50 ? `tails` : `heads`;
      points[message.author.id].coins -= sum;
      let spelling = winner === 'tails' ? `Выпала решка` : 'Выпал орел';
      embed.setDescription(`Подкидываем монетку..`); 
      return message.channel.send(embed)
        .then(newMsg => {
          setTimeout(() => {
            embed.setDescription(`${spelling}. **Вы** проиграли **${dollar}${sum.toLocaleString()}**`);
            if (winner === variant) {
              points[message.author.id].coins += sum * 2;
              embed.setDescription(`${spelling}. **Вы** выиграли и получили **${dollar}${(sum * 2).toLocaleString()}**`);
              return newMsg.edit(embed);
            } else return newMsg.edit(embed);
          }, 1000);
        });
    }

    if(command === 'avatar') {
      if (!args[0]) return message.channel.send(`:x: Не могу найти пользователя`);
      let user = message.mentions.users.first() || bot.users.get(args[0]) || bot.users.find('tag', args.join(' '));
      if (!user) return message.channel.send(`:x: Не могу найти пользователя`);
      return message.channel.send(new Discord.RichEmbed().setAuthor(user.tag, user.displayAvatarURL).setImage(`${user.displayAvatarURL}?size=1024`));
    };

});

client.login(token);