import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import UserAgent from "user-agents";
import moment from "moment";

const discord = {
    url: "https://discord.com/api/v9",
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    delay: parseInt(process.env.DELAY),
};

const getMe = async () => {
    const get = await axios.get(discord.url + "/users/@me", {
        headers: {
            authorization: discord.token,
            "User-Agent": new UserAgent().toString(),
        },
    });
    return get.data;
};

const getMessages = async (limit = 1) => {
    const get = await axios.get(
        discord.url +
            "/channels/" +
            discord.channelId +
            "/messages?limit=" +
            limit,
        {
            headers: {
                authorization: discord.token,
                "User-Agent": new UserAgent().toString(),
            },
        }
    );
    return get.data;
};

const delay = async (timeInMs) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMs);
    });
};

(async () => {
    try {
        if (
            !discord.token ||
            !discord.channelId ||
            discord.token == "" ||
            discord.channelId == ""
        ) {
            throw new Error(
                `[!] Please provide your Discord token and Channel Id on .env`
            );
        }
        const me = await getMe();
        console.log(
            `[${moment().format("LTS")}] Hello, ${me.username}#${
                me.discriminator
            }`
        );

        const hi = [
            "hi",
            "hello",
            "hellow",
            "hi guys",
            "hello guys",
            "hy",
            "hy guys",
            "yo",
            "yoo",
            "yow",
        ];

        const helloArray = [
            "Hello fren",
            "Hi there",
            "Sup",
            "Hi guys",
            "GM",
            "how are you?",
        ];
        while (true) {
            const getMessage = await getMessages(1);
            if (!getMessage[0].id) {
                throw new Error(`[!] Cant get latest messages from Channel Id`);
            }
            console.log(
                `[${moment().format("LTS")}] Latest chat from ${
                    getMessage[0].author.username
                }#${getMessage[0].author.discriminator} with content "${
                    getMessage[0].content
                }"`
            );
            if (hi.includes(getMessage[0].content.toLowerCase().trim())) {
                const sendReply = await axios.post(
                    discord.url +
                        "/channels/" +
                        discord.channelId +
                        "/messages",
                    JSON.stringify({
                        content:
                            helloArray[
                                Math.floor(Math.random() * helloArray.length)
                            ],
                        message_reference: {
                            message_id: getMessage[0].id,
                        },
                    }),
                    {
                        headers: {
                            authorization: discord.token,
                            "User-Agent": new UserAgent().toString(),
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log(
                    `[${moment().format("LTS")}] Reply chat form ${
                        getMessage[0].author.username
                    }#${getMessage[0].author.discriminator} content "${
                        getMessage[0].content
                    }"`
                );
                console.log(
                    `[${moment().format("LTS")}] Replied with "${
                        sendReply.data.content
                    }"`
                );
            } else {
                const sendMessage = await axios.post(
                    discord.url +
                        "/channels/" +
                        discord.channelId +
                        "/messages",
                    JSON.stringify({
                        content:
                            helloArray[
                                Math.floor(Math.random() * helloArray.length)
                            ],
                    }),
                    {
                        headers: {
                            authorization: discord.token,
                            "User-Agent": new UserAgent().toString(),
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!sendMessage.data.id) {
                    throw new Error(`[!] Error while send message to channel`);
                }
                console.log(
                    `[${moment().format(
                        "LTS"
                    )}] Send message to channel with content "${
                        sendMessage.data.content
                    }"`
                );
                const messageId = sendMessage.data.id;
                if (
                    await axios.delete(
                        discord.url +
                            "/channels/" +
                            discord.channelId +
                            "/messages/" +
                            messageId,
                        {
                            headers: {
                                authorization: discord.token,
                                "User-Agent": new UserAgent().toString(),
                            },
                        }
                    )
                ) {
                    console.log(
                        `[${moment().format(
                            "LTS"
                        )}] Deleted message id ${messageId}`
                    );
                }
            }

            console.log(
                `\n[${moment().format("LTS")}] Delay ${
                    discord.delay
                } miliseconds\n`
            );
            await delay(discord.delay);
        }
    } catch (error) {
        console.error(error);
    }
})();
