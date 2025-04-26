using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/[controller]")]
public class TestsController : ControllerBase
{
    private readonly IConfiguration _config;

    public TestsController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetTests()
    {
        var tests = new List<object>();

        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand("SELECT * FROM Tests", conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            tests.Add(new
            {
                Id = reader.GetInt32(0),
                Block = reader.GetInt32(1),
                NameBlock = reader.GetString(2),
                Question = reader.GetString(3),
                VariantA = reader.GetString(4),
                VariantB = reader.GetString(5),
                VariantC = reader.GetString(6),
                VariantD = reader.IsDBNull(7) ? null : reader.GetString(7),
                Answer = reader.GetString(8)
            });
        }

        return Ok(tests);
    }
}
