import * as navbar from './loadNavbar.js';
import { checkLogin, setupLogout } from './checkLogin.js';

window.addEventListener('DOMContentLoaded', async () => {

    await navbar.loadNavbar();
    const user = await checkLogin(false, true);
    navbar.zeigeAdminBereich(user);

    if (user) setupLogout();

    // const user2 = await determineUserId(user);
    // console.log("User-ID für Tour-Details:", user2.user_id);
    ladeTourDetails(user);

});


async function ladeTourDetails(user) {
    // ID aus URL auslesen
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Keine Tour-ID übergeben.");
        return;
    }

    try {
        const res = await fetch(`/api/tour/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error("Tour nicht gefunden.");

        const data = await res.json();
        const tour = data.data[0];
        console.log(tour);

        // -----------------------------
        // Felder dynamisch füllen
        // -----------------------------
        const isoString = tour.tour_date; // z.B. "2026-02-15T00:00:00.000Z"

        // Datum
        const [datePart, timePart] = isoString.split('T'); // ["2026-02-15", "00:00:00.000Z"]
        const [year, month, day] = datePart.split('-');
        document.getElementById("tourTitle").textContent = tour.destination;
        document.getElementById("tourDate").textContent = `${day}.${month}.${year}`;
        const time = timePart.substring(0,5); // "00:00"
        document.getElementById("tourDeparture").textContent = time;
        document.getElementById("tourSeats").textContent = `${tour.bus.bus_seats} Plätze`;
        document.getElementById("tourDescription").textContent = tour.tour_description;
        document.getElementById("tourImage").src = tour.picture_url;

        

        // Reservierungsknopf
        //document.getElementById("reserve_or_cancel_Btn").addEventListener("click", () => {
            //window.location.href = `reservierung.html?id=${tour.tour_id}`;
        const reserve_or_cancel_Btn = document.getElementById("reserve_or_cancel_Btn");
            
            //Abfrage, ob Nutzer diese Tour schon gebucht hat
            

            if (await userHasBooked(user, tour)) {
                // Button zum Stornieren
                reserve_or_cancel_Btn.textContent = "Buchung stornieren";
                reserve_or_cancel_Btn.className = "btn btn-outline-danger mt-3";


                 reserve_or_cancel_Btn.addEventListener("click", async () => {
                    // Ändert die Zahl der Sitzplätze im entsprechenden Bus
                    await increaseSeats(tour);
            
                    // Buchung erstellen in user_tour Tabelle
                    await cancelTour(tour, user);
                    window.location.reload();
                    //window.location.href = "fahrten.html"; // Zurück zur Übersicht
                });



            }
            else {
                reserve_or_cancel_Btn.textContent = "Platz reservieren";
                reserve_or_cancel_Btn.className = "btn btn-outline-primary mt-3";
                console.log("Bus-ID der Tour:", tour.bus.bus_id);
            
                if (tour.bus.bus_seats <= 0) {
                    alert("Keine freien Plätze mehr verfügbar.");
                    return;
                }
            
            
                reserve_or_cancel_Btn.addEventListener("click", async () => {
                    // Ändert die Zahl der Sitzplätze im entsprechenden Bus
                    await reduceSeats(tour);
            
                    // Buchung erstellen in user_tour Tabelle
                    await bookTour(tour, user);
                    window.location.reload();
                    //window.location.href = "fahrten.html"; // Zurück zur Übersicht
                });
        };

    } catch (err) {
        console.error(err);
        document.querySelector(".info-card").innerHTML =
            `<p class="text-danger text-center p-3">Fehler beim Laden der Tour.</p>`;
    }
//window.location.reload();

}



async function reduceSeats(tour) {

            // Daten für Bus ändern
            const updated_Seats = tour.bus.bus_seats - 1

            const newBus = {
                bus_id: tour.bus.bus_id,
                bus_seats: updated_Seats
                
            };  
            const response = await fetch(`/api/buses/${tour.bus.bus_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newBus)
            });
            if (!response.ok) {
                throw new Error(`API Fehler beim Buchen eines Platzes: ${response.status}`);
            }
        }

async function increaseSeats(tour) {

            // Daten für Bus ändern
            const updated_Seats = tour.bus.bus_seats + 1

            const newBus = {
                bus_id: tour.bus.bus_id,
                bus_seats: updated_Seats
                
            };  
            const response = await fetch(`/api/buses/${tour.bus.bus_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newBus)
            });
            if (!response.ok) {
                throw new Error(`API Fehler beim Buchen eines Platzes: ${response.status}`);
            }
        }





async function bookTour(tour, user) {const bookingResponse = await fetch("/api/user_tour", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ user_id: user.user_id, tour_id: tour.tour_id })
            });
            if (!bookingResponse.ok) {
                throw new Error(`API Fehler beim Buchen der Tour: ${bookingResponse.status}`);
            }
        }

async function cancelTour(tour, user) {const bookingResponse = await fetch(`/api/user_tour/${user.user_id}/${tour.tour_id}`, {
                method: "DELETE",
                credentials: "include"
            });
        }


// async function determineUserId(user) {
// const response = await fetch(`/api/user/by-username/${user.username}`, { credentials: "include" });
//         if (!response.ok) throw new Error(`Fehler beim Laden des Mitglieds ueber name: ${response.status}`);

//         const json  = await response.json();
//         const user2 = json.data;
//         return user2;
// }

// Überprüft, ob der eingeloggte Nutzer die Tour bereits gebucht hat
const userHasBooked = async (user, tour) => {
                const bookingResponse = await fetch(`/api/user_tour/simple/${user.user_id}`, { credentials: "include" }); 
                if (!bookingResponse.ok) {
                    throw new Error(`API Fehler bei Abfrage ob gebucht wurde: ${bookingResponse.status}`);
                }       
                const bookingData = await bookingResponse.json();
                const bookings = bookingData.data;
                console.log("Bookings:", bookings.tours);
                
                for (const booking_temp of bookings.tours) {
                    if (booking_temp.tour_id === tour.tour_id) {
                        console.log("Nutzer hat diese Tour bereits gebucht.");
                        return true;
                    } 
                    else {
                        console.log("Nutzer hat diese Tour noch nicht gebucht.");   
                    }
                }
                return false;

                //return bookings.some(booking => booking.tour_id === tour.tour_id);
            }