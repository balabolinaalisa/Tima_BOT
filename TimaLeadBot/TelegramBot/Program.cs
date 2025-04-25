using Npgsql;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;
using Telegram.Bot.Polling;

class Program
{
    private static ITelegramBotClient _telegramBot = new TelegramBotClient("8087733051:AAF8gXI62O7fkwqI-BTujT6clQf7d0yeTzo");
    private static string _connectionString = "Host=localhost;Port=5432;Username=botuser;Password=botpass;Database=telegrambot\r\n";

    static async Task Main(string[] args)
    {
        Console.WriteLine("Бот запущен");

        //string folder = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Блоки", "Блок 4. Управление командой");
        //string fullFolderPath = Path.GetFullPath(folder);

        //await UploadAllFilesFromFolderAsync(fullFolderPath, "Блок 4");


        var cts = new CancellationTokenSource();
        _telegramBot.StartReceiving(
            HandleUpdateAsync,
            HandleErrorAsync,
            new ReceiverOptions(),
            cancellationToken: cts.Token
        );

        _ = Task.Run(() => StartRemindersLoop());

        Console.ReadLine();
    }

    //public static async Task UploadAllFilesFromFolderAsync(string folderPath, string category)
    //{
    //    string[] files = Directory.GetFiles(folderPath, "*.*", SearchOption.AllDirectories);

    //    foreach (var filePath in files)
    //    {
    //        string extension = Path.GetExtension(filePath).ToLower();
    //        string fileType = extension switch
    //        {
    //            ".png" => "image",
    //            ".jpg" => "image",
    //            ".docx" => "document",
    //            ".pdf" => "document",
    //            ".m4a" => "audio",
    //            _ => null 
    //        };

    //        if (fileType == null)
    //        {
    //            Console.WriteLine($"Пропущен файл (неподдерживаемый тип): {filePath}");
    //            continue;
    //        }

    //        string description = Path.GetFileNameWithoutExtension(filePath);

    //        try
    //        {
    //            await UploadFileToDatabaseAsync(filePath, fileType, category, description);
    //            Console.WriteLine($"Загружен: {description}");
    //        }
    //        catch (Exception ex)
    //        {
    //            Console.WriteLine($"Ошибка при загрузке {filePath}: {ex.Message}");
    //        }
    //    }

    //    Console.WriteLine("Загрузка всех файлов завершена.");
    //}

    public static async Task UploadFileToDatabaseAsync(string filePath, string fileType, string category, string description)
    {
        byte[] fileData = await File.ReadAllBytesAsync(filePath);
        string fileName = Path.GetFileName(filePath);

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var command = new NpgsqlCommand("INSERT INTO BotFiles (FileName, FileType, FileData, Category, Description) VALUES (@fileName, @fileType, @fileData, @category, @description)", connection);
        command.Parameters.AddWithValue("fileName", fileName);
        command.Parameters.AddWithValue("fileType", fileType);
        command.Parameters.AddWithValue("fileData", fileData);
        command.Parameters.AddWithValue("category", category);
        command.Parameters.AddWithValue("description", description);

        await command.ExecuteNonQueryAsync();
        Console.WriteLine($"Файл {fileName} успешно загружен в базу.");
    }

    public static async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
    {
        if (update.Type == UpdateType.Message && update.Message?.Text?.ToLower() == "/start")
        {
            await LogUserInteraction(update.Message.From, "Запуск бота (/start)");
            await ShowMainMenu(botClient, update.Message.Chat.Id, cancellationToken);
        }

        if (update.Type == UpdateType.CallbackQuery)
        {
            var user = update.CallbackQuery.From;
            var chatId = update.CallbackQuery.Message.Chat.Id;
            var data = update.CallbackQuery.Data;

            await LogUserInteraction(user, data);

            if (data.StartsWith("send_file:"))
            {
                var id = data.Substring("send_file:".Length);
                await SendDocument(botClient, chatId, id, cancellationToken);
            }
            else if (data.StartsWith("send_audio:"))
            {
                var id = data.Substring("send_audio:".Length);
                await SendAudio(botClient, chatId, id, cancellationToken);
            }
            else
            {
                switch (data)
                {
                    case "block1":
                        await ShowFilesFromCategory(botClient, chatId, "Блок 1", cancellationToken);
                        break;
                    case "block2":
                        await ShowFilesFromCategory(botClient, chatId, "Блок 2", cancellationToken);
                        break;
                    case "block3":
                        await ShowFilesFromCategory(botClient, chatId, "Блок 3", cancellationToken);
                        break;
                    case "block4":
                        await ShowFilesFromCategory(botClient, chatId, "Блок 4", cancellationToken);
                        break;
                    case "profile":
                        string profile = $"👤 {user.FirstName} {user.LastName}\n\n📊 Тесты: пока ничего не пройдено.";
                        await botClient.SendTextMessageAsync(chatId, profile, replyMarkup: BackButton(), cancellationToken: cancellationToken);
                        break;
                    case "back_to_menu":
                        await ShowMainMenu(botClient, chatId, cancellationToken);
                        break;
                }
            }
        }
    }

    public static async Task ShowMainMenu(ITelegramBotClient botClient, long chatId, CancellationToken cancellationToken)
    {
        var keyboard = new InlineKeyboardMarkup(new[]
        {
            new[] { InlineKeyboardButton.WithCallbackData("📁 Блок 1", "block1") },
            new[] { InlineKeyboardButton.WithCallbackData("📁 Блок 2", "block2") },
            new[] { InlineKeyboardButton.WithCallbackData("📁 Блок 3", "block3") },
            new[] { InlineKeyboardButton.WithCallbackData("📁 Блок 4", "block4") },
            new[] { InlineKeyboardButton.WithCallbackData("👤 Профиль", "profile") }
        });

        await botClient.SendTextMessageAsync(chatId, "Привет! Выбери, что тебе интересно:", replyMarkup: keyboard, cancellationToken: cancellationToken);
    }

    public static async Task ShowFilesFromCategory(ITelegramBotClient botClient, long chatId, string category, CancellationToken cancellationToken)
    {
        List<InlineKeyboardButton[]> rows = new List<InlineKeyboardButton[]>();

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var command = new NpgsqlCommand("SELECT Id, FileName, FileType FROM BotFiles WHERE Category = @category", connection);
        command.Parameters.AddWithValue("category", category);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            int id = reader.GetInt32(0);
            string fileName = reader.GetString(1);
            string fileType = reader.GetString(2);

            string callback = fileType == "audio" ? $"send_audio:{id}" : $"send_file:{id}";
            rows.Add(new[] { InlineKeyboardButton.WithCallbackData($"📎 {Path.GetFileNameWithoutExtension(fileName)}", callback) });
        }

        rows.Add(new[] { InlineKeyboardButton.WithCallbackData("⬅ Назад", "back_to_menu") });

        var markup = new InlineKeyboardMarkup(rows);
        await botClient.SendTextMessageAsync(chatId, "Файлы блока:", replyMarkup: markup, cancellationToken: cancellationToken);
    }

    public static async Task SendDocument(ITelegramBotClient botClient, long chatId, string id, CancellationToken cancellationToken)
    {
        byte[] data;
        string fileName;

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var command = new NpgsqlCommand("SELECT FileData, FileName FROM BotFiles WHERE Id = @id", connection);
        command.Parameters.AddWithValue("@id", int.Parse(id));

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            await botClient.SendTextMessageAsync(chatId, "Файл не найден", cancellationToken: cancellationToken);
            return;
        }

        data = (byte[])reader["FileData"];
        fileName = reader["FileName"].ToString();
        using var stream = new MemoryStream(data);

        await botClient.SendDocumentAsync(chatId, new InputFileStream(stream, fileName), cancellationToken: cancellationToken);
    }

    public static async Task SendAudio(ITelegramBotClient botClient, long chatId, string id, CancellationToken cancellationToken)
    {
        byte[] data;
        string fileName;

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var command = new NpgsqlCommand("SELECT FileData, FileName FROM BotFiles WHERE Id = @id", connection);
        command.Parameters.AddWithValue("@id", int.Parse(id));

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            await botClient.SendTextMessageAsync(chatId, "Аудиофайл не найден", cancellationToken: cancellationToken);
            return;
        }

        data = (byte[])reader["FileData"];
        fileName = reader["FileName"].ToString();
        using var stream = new MemoryStream(data);

        await botClient.SendAudioAsync(chatId, new InputFileStream(stream, fileName), cancellationToken: cancellationToken);
    }

    public static InlineKeyboardMarkup BackButton()
    {
        return new InlineKeyboardMarkup(InlineKeyboardButton.WithCallbackData("⬅ Назад", "back_to_menu"));
    }

    public static Task HandleErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Ошибка: {exception.Message}");
        return Task.CompletedTask;
    }

    public static async Task LogUserInteraction(User user, string action)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var selectUser = new NpgsqlCommand("SELECT COUNT(*) FROM Users WHERE Id = @id", connection);
        selectUser.Parameters.AddWithValue("id", user.Id);
        var count = (long)await selectUser.ExecuteScalarAsync();

        if (count == 0)
        {
            var insertUser = new NpgsqlCommand("INSERT INTO Users (Id, FirstName, LastName, Username) VALUES (@id, @firstName, @lastName, @username)", connection);
            insertUser.Parameters.AddWithValue("id", user.Id);
            insertUser.Parameters.AddWithValue("firstName", (object?)user.FirstName ?? DBNull.Value);
            insertUser.Parameters.AddWithValue("lastName", (object?)user.LastName ?? DBNull.Value);
            insertUser.Parameters.AddWithValue("username", (object?)user.Username ?? DBNull.Value);
            await insertUser.ExecuteNonQueryAsync();
        }

        var insertHistoryCmd = new NpgsqlCommand("INSERT INTO UserHistory (UserId, Action) VALUES (@userId, @action)", connection);
        insertHistoryCmd.Parameters.AddWithValue("userId", user.Id);
        insertHistoryCmd.Parameters.AddWithValue("action", action);
        await insertHistoryCmd.ExecuteNonQueryAsync();
    }

    public static async Task<List<int>> GetAllUserIds()
    {
        var ids = new List<int>();
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        var cmd = new NpgsqlCommand("SELECT Id FROM Users", connection);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            ids.Add(reader.GetInt32(0));
        }
        return ids;
    }

    public static async Task StartRemindersLoop()
    {
        while (true)
        {
            var now = DateTime.Now;
            var target = now.Date.AddHours(12);
            if (now >= target) target = target.AddDays(1);

            var delay = target - now;
            Console.WriteLine($"Ждём {delay.TotalMinutes:F1} минут до рассылки...");
            await Task.Delay(delay);

            var ids = await GetAllUserIds();
            foreach (var id in ids)
                await _telegramBot.SendTextMessageAsync(id, "⏰ Напоминание: !!!!!!!");

            Console.WriteLine("Напоминание отправлено.");
        }
    }

}
