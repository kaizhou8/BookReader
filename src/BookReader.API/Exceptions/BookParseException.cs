namespace BookReader.API;

public class BookParseException : Exception
{
    public BookParseException(string message) : base(message)
    {
    }

    public BookParseException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
