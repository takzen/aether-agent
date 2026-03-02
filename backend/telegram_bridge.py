import os
import asyncio
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from local_db import sqlite_service
import json
import httpx

# Setup
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USER_ID = os.getenv("TELEGRAM_USER_ID") # Only allowed user can talk to the bot

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
                    "session_id": "telegram_mobile_link",
                    "source": "telegram"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    answer = data.get("response", "No response body.")
                    
                    if isinstance(answer, dict):
                        # Extract just the response field, ignore confidence_score and other JSON keys
                        answer = answer.get("response", str(answer))
                    elif not isinstance(answer, str):
                        answer = str(answer)
                        
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

async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = str(update.effective_user.id)
    if ALLOWED_USER_ID and user_id != ALLOWED_USER_ID:
        return
        
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action='upload_document')
    
    try:
        from pathlib import Path
        workspace_dir = Path(__file__).resolve().parent.parent / "workspace"
        workspace_dir.mkdir(parents=True, exist_ok=True)
        
        caption = update.message.caption or ""
        file_id = None
        file_name = None
        
        if update.message.photo:
            photo = update.message.photo[-1]
            file_id = photo.file_id
            file_name = f"photo_{file_id[-6:]}.jpg"
        elif update.message.document:
            doc = update.message.document
            file_id = doc.file_id
            file_name = doc.file_name or f"document_{file_id[-6:]}"
            
        if not file_id:
            await update.message.reply_text("Unsupported file type.")
            return
            
        new_file = await context.bot.get_file(file_id)
        
        target_path = workspace_dir / file_name
        counter = 1
        stem = target_path.stem
        ext = target_path.suffix
        while target_path.exists():
            target_path = workspace_dir / f"{stem}_{counter}{ext}"
            counter += 1
            
        await new_file.download_to_drive(custom_path=target_path)
        
        await sqlite_service.add_log("info", "TELEGRAM", f"Received file {target_path.name} from Telegram.")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            message = f"Właśnie wysłałem Ci plik/zdjęcie o nazwie '{target_path.name}' prosto do folderu workspace/."
            if caption:
                message += f" Z następującym opisem/instrukcją: '{caption}'"
                
            response = await client.post(
                "http://localhost:8000/chat",
                json={
                    "message": message,
                    "session_id": "telegram_mobile_link",
                    "source": "telegram"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    answer = data.get("response", "File received by Aether.")
                    if len(answer) > 4000:
                        for x in range(0, len(answer), 4000):
                            await update.message.reply_text(answer[x:x+4000])
                    else:
                        await update.message.reply_text(answer)
                else:
                    await update.message.reply_text(f"Zapisano plik jako {target_path.name}, ale agent zwrócił błąd: {data.get('message')}")
            else:
                await update.message.reply_text(f"Zapisano plik {target_path.name}, ale rdzeń Aether jest offline.")
                
    except Exception as e:
        await update.message.reply_text(f"Nie udało się przetworzyć pliku: {str(e)}")

telegram_app = None

async def run_telegram_bot():
    global telegram_app
    if not TELEGRAM_TOKEN:
        print("[Telegram Link] Disabled. TELEGRAM_BOT_TOKEN not found in .env")
        return
        
    telegram_app = Application.builder().token(TELEGRAM_TOKEN).build()

    telegram_app.add_handler(CommandHandler("start", start_cmd))
    telegram_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    telegram_app.add_handler(MessageHandler(filters.PHOTO | filters.Document.ALL, handle_document))

    print("[Telegram Link] Connecting to Telegram Secure Bridge...")
    try:
        await telegram_app.initialize()
        await telegram_app.start()
        # Removing drop_pending_updates=True as it is a common cause of Conflict during fast reloads
        await telegram_app.updater.start_polling()
        print("[Telegram Link] Telegram Listener Active.")
    except Exception as e:
        if "Conflict" in str(e):
            print("[Telegram Link] SESSION CONFLICT: Another instance of this bot is already active.")
            print("[Telegram Link] Proceeding in DASHBOARD-ONLY mode. Telegram bridge will be offline.")
        else:
            print(f"[Telegram Link] Initialization failed: {e}")

async def stop_telegram_bot():
    global telegram_app
    if telegram_app is not None:
        try:
            print("[Telegram Link] Disconnecting...")
            await telegram_app.updater.stop()
            await telegram_app.stop()
            await telegram_app.shutdown()
            print("[Telegram Link] Offline.")
        except Exception as e:
            print(f"[Telegram Link] Error during shutdown: {e}")
        finally:
            telegram_app = None
if __name__ == "__main__":
    # Wait for Aether API to boot first if we run this as standalone module
    asyncio.run(run_telegram_bot())
