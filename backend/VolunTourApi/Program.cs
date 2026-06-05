using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

// In-Memory База данни с вече добавени локации за Несебър
var tours = new List<Tour>
{
    new Tour { Id = 1, Title = "Спасяване на Южната стена", Guide = "Никола", AvatarUrl = "https://ui-avatars.com/api/?name=Nikola&background=ff3366&color=fff", Cause = "Почистване на бурени около византийската стена.", Lat = 42.6578, Lng = 27.7345, MaxSpots = 15, CurrentSpots = 5 },
    new Tour { Id = 2, Title = "Еко Патрул: Южен Плаж", Guide = "Деян", AvatarUrl = "https://ui-avatars.com/api/?name=Deyan&background=00ff66&color=000", Cause = "Събиране на пластмаса след бурята.", Lat = 42.6512, Lng = 27.7145, MaxSpots = 20, CurrentSpots = 12 }
};

app.MapGet("/api/tours", () => Results.Ok(tours));

app.MapPost("/api/tours", (Tour newTour) =>
{
    newTour.Id = tours.Count + 1;
    tours.Add(newTour);
    return Results.Ok(newTour);
});

app.Run();

// Моделът на данните
public class Tour
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Guide { get; set; }
    public string AvatarUrl { get; set; }
    public string Cause { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public int MaxSpots { get; set; }
    public int CurrentSpots { get; set; }
}