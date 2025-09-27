function scrapeSubjectRows() {
    const infoArray = [];
    let index = 0;
    while (true) {
        const id_enrollment = `DERIVED_SSR_FL_SSR_DRV_STAT$392$$${index}`;
        const id_classname = `DERIVED_SSR_FL_SSR_SCRTAB_DTLS$${index}`;
        const id_days = `DERIVED_SSR_FL_SSR_DAYS1$${index}`;
        const id_time = `DERIVED_SSR_FL_SSR_DAYSTIMES1$${index}`;
        const id_building_room = `DERIVED_SSR_FL_SSR_DRV_ROOM1$${index}`;

        const enrollmentEl = document.getElementById(id_enrollment);
        const classEl = document.getElementById(id_classname);
        const daysEl = document.getElementById(id_days);
        const timeEl = document.getElementById(id_time);
        const roomEl = document.getElementById(id_building_room);

        // Stop if the main element doesn't exist
        if (!classEl) break;

        if (!(enrollmentEl.textContent.includes("Enrolled"))) {
            index++;
            continue;
        }

        // Build a JSON object for this row
        const rowInfo = {
            class: classEl ? classEl.textContent.trim() : null,
            days: daysEl ? daysEl.textContent.trim() : null,
            time: timeEl ? timeEl.textContent.trim() : null,
            room: roomEl ? roomEl.textContent.trim() : null
        };

        infoArray.push(rowInfo);
        index++;
    }
    return infoArray;
}

function formatScrapedRows(infoArray) {
    // Format Class Code
    
    newClass

}