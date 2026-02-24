import os
import asyncio
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from local_db import sqlite_service
import json

# Setup
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USER_ID = os.getenv("TELEGRAM_USER_ID") # Only allowed user can talk to the bot

# We will need a way to communicate with our Main API
# Since this bot will run alongside FastAPI, we can make internal HTTP calls 
# to our own Chat API, keeping Telegram strictly as a bridge.
import httpx

async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = str(update.effective_user.id)
    if ALLOWED_USER_ID and user_id != ALLOWED_USER_ID:
        await update.message.reply_text("Unauthorized access. This incident will be reported.")
        return
        
    await update.message.reply_text("Aether Core Bridge Connected. Waiting for commands...")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = str(update.effective_user.id)
    if ALLOWED_USER_ID and user_id != ALLOWED_USER_ID:
        return
        
    user_text = update.message.text
    
    # Send "typing" action
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action='typing')
    
    try:
        # Call the local Aether Core API to fetch reasoning just like the Dashboard
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:8000/chat",
                json={
                    "message": user_text,
                    "session_id": "telegram_mobile_link"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    answer = data.get("response", "No response body.")
                    # Telegram limit per message is 4096 chars formatting
                    if len(answer) > 4000:
                        for x in range(0, len(answer), 4000):
                            await update.message.reply_text(answer[x:x+4000])
                    else:
                        await update.message.reply_text(answer)
                else:
                    await update.message.reply_text(f"Core Error: {data.get('message')}")
            else:
                await update.message.reply_text(f"System Offline. HTTP: {response.status_code}")
                
    except Exception as e:
        await update.message.reply_text(f"Connection to Aether Core failed: {str(e)}")

async def run_telegram_bot():
    if not TELEGRAM_TOKEN:
        print("[Telegram Link] Disabled. TELEGRAM_BOT_TOKEN not found in .env")
        return
        
    application = Application.builder().token(TELEGRAM_TOKEN).build()

    application.add_handler(CommandHandler("start", start_cmd))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("[Telegram Link] Connecting to Telegram Secure Bridge...")
    try:
        await application.initialize()
        await application.start()
        await application.updater.start_polling(drop_pending_updates=True)
        print("[Telegram Link] Telegram Listener Active.")
    except Exception as e:
        print(f"[Telegram Link] Failed to initialize: {e}")

if __name__ == "__main__":
    # Wait for Aether API to boot first if we run this as standalone module
    asyncio.run(run_telegram_bot())
    # Note: Application needs to be kept alive, so usually loop.run_forever() is used, 
    # but we'll integrate it into main.py's lifespan or background task.
