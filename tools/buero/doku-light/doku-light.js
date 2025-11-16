// doku-light.js
// Zentrale Logik für Dokumenten-Tool Light

(function () {
    const STORAGE_KEY_CURRENT = "dokuLight-current";
    const STORAGE_KEY_PRINT = "dokuLight-print-data";
    const STORAGE_KEY_LOGO = "dokuLight-logo";

    // Hilfsfunktionen -----------------------------------------------------

    function $(id) {
        return document.getElementById(id);
    }

    function getVal(id) {
        const el = $(id);
        return el ? el.value || "" : "";
    }

    function setVal(id, value) {
        const el = $(id);
        if (el) el.value = value || "";
    }

    function getChecked(id) {
        const el = $(id);
        return !!(el && el.checked);
    }

    function setChecked(id, v) {
        const el = $(id);
        if (el) el.checked = !!v;
    }

    // WICHTIG: neue parseNumber, die Punkt UND Komma richtig behandelt
    function parseNumber(text) {
        if (text == null) return 0;
        if (typeof text === "number") return text || 0;

        let t = String(text).trim();
        if (!t) return 0;

        const hasComma = t.indexOf(",") !== -1;

        if (hasComma) {
            // Typisch deutsch: 1.234,56
            // Punkte = Tausender, Komma = Dezimal
            t = t.replace(/\./g, "").replace(",", ".");
        }

        // Alle Zeichen außer Ziffern, Punkt und Minus entfernen
        t = t.replace(/[^0-9.\-]/g, "");
        if (!t) return 0;

        const n = parseFloat(t);
        return isNaN(n) ? 0 : n;
    }

    function formatCurrency(amount, currencyCode) {
        const code = currencyCode || getVal("currency") || "EUR";
        try {
            return new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: code
            }).format(amount);
        } catch (_) {
            return amount.toFixed(2) + " " + code;
        }
    }

    // Positionen ----------------------------------------------------------

    function addItemRow(data) {
        const tbody = $("itemsBody");
        if (!tbody) return;

        const tr = document.createElement("tr");

        function tdInput(cls, value, type) {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = type || "text";
            input.className = cls;
            if (typeof value !== "undefined" && value !== null) {
                input.value = value;
            }
            td.appendChild(input);
            return { td, input };
        }

        // Pos (nur Anzeige)
        const tdPos = document.createElement("td");
        tdPos.className = "item-pos";
        tdPos.textContent = tbody.children.length + 1;
        tr.appendChild(tdPos);

        const bezeichnung = tdInput("item-name", data && data.name || "");
        tr.appendChild(bezeichnung.td);

        const details = tdInput("item-desc", data && data.desc || "");
        tr.appendChild(details.td);

        const menge = tdInput("item-qty", data && data.qty || "", "number");
        tr.appendChild(menge.td);

        // Einheit ist nur Text
        const einheit = tdInput("item-unit", data && data.unit || "");
        tr.appendChild(einheit.td);

        // Einzelpreis jetzt als TEXT, damit € angezeigt werden kann
        const preis = tdInput("item-price", data && data.price || "", "text");
        tr.appendChild(preis.td);

        const mwst = tdInput("item-vat", data && data.vat || "19", "number");
        tr.appendChild(mwst.td);

        const tdTotal = document.createElement("td");
        const totalInput = document.createElement("input");
        totalInput.type = "text";
        totalInput.className = "item-total";
        totalInput.readOnly = true;
        tdTotal.appendChild(totalInput);
        tr.appendChild(tdTotal);

        // Rechnen bei Eingabe
        [menge.input, einheit.input, preis.input, mwst.input].forEach(inp => {
            inp.addEventListener("input", function () {
                recalcRow(tr);
                recalcSums();
            });
        });

        // Preis-Feld beim Verlassen hübsch mit Währung formatieren
        preis.input.addEventListener("blur", function () {
            const num = parseNumber(preis.input.value);
            if (!num) {
                preis.input.value = "";
            } else {
                preis.input.value = formatCurrency(num);
            }
        });

        tbody.appendChild(tr);
        recalcRow(tr);
        recalcSums();
    }

    function renumberPositions() {
        const rows = $("itemsBody").querySelectorAll("tr");
        rows.forEach((tr, idx) => {
            const posCell = tr.querySelector(".item-pos");
            if (posCell) posCell.textContent = idx + 1;
        });
    }

    function recalcRow(tr) {
        const qtyInput = tr.querySelector(".item-qty");
        const priceInput = tr.querySelector(".item-price");
        const vatInput = tr.querySelector(".item-vat");

        const qty = parseNumber(qtyInput ? qtyInput.value : 0);
        const price = parseNumber(priceInput ? priceInput.value : 0);

        const vatRate = getChecked("isKleinunternehmer")
            ? 0
            : parseNumber(vatInput ? vatInput.value : 0);

        const net = qty * price;
        const vat = net * (vatRate / 100);
        const gross = net + vat;

        const totalInput = tr.querySelector(".item-total");
        if (totalInput) {
            totalInput.value = net || vatRate !== 0 ? formatCurrency(gross) : "";
        }

        return { net, vat, gross };
    }

    function recalcSums() {
        const tbody = $("itemsBody");
        if (!tbody) return;

        let sumNet = 0;
        let sumVat = 0;
        let sumGross = 0;

        const rows = tbody.querySelectorAll("tr");
        rows.forEach(tr => {
            const res = recalcRow(tr);
            sumNet += res.net;
            sumVat += res.vat;
            sumGross += res.gross;
        });

        const netEl = $("sumNet");
        const vatEl = $("sumVat");
        const grossEl = $("sumGross");

        if (netEl) netEl.value = sumNet ? formatCurrency(sumNet) : "";
        if (vatEl) vatEl.value = formatCurrency(sumVat);
        if (grossEl) grossEl.value = sumGross ? formatCurrency(sumGross) : "";
    }

    // Form-Daten sammeln / anwenden --------------------------------------

    function collectFormData() {
        const items = [];
        const rows = $("itemsBody").querySelectorAll("tr");
        rows.forEach(tr => {
            items.push({
                name: tr.querySelector(".item-name")?.value || "",
                desc: tr.querySelector(".item-desc")?.value || "",
                qty: tr.querySelector(".item-qty")?.value || "",
                unit: tr.querySelector(".item-unit")?.value || "",
                price: tr.querySelector(".item-price")?.value || "",
                vat: tr.querySelector(".item-vat")?.value || ""
            });
        });

        return {
            docType: getVal("docType"),
            docNumber: getVal("docNumber"),
            docDate: getVal("docDate"),
            paymentTerms: getVal("paymentTerms"),
            currency: getVal("currency"),
            customerOrderNumber: getVal("customerOrderNumber"),
            serviceDateFrom: getVal("serviceDateFrom"),
            serviceDateTo: getVal("serviceDateTo"),
            isKleinunternehmer: getChecked("isKleinunternehmer"),

            bankHolder: getVal("bankHolder"),
            bankName: getVal("bankName"),
            bankIban: getVal("bankIban"),
            bankBic: getVal("bankBic"),
            bankNote: getVal("bankNote"),

            vendorName: getVal("vendorName"),
            vendorCompany: getVal("vendorCompany"),
            vendorStreet: getVal("vendorStreet"),
            vendorZipCity: getVal("vendorZipCity"),
            vendorEmail: getVal("vendorEmail"),
            vendorPhone: getVal("vendorPhone"),
            vendorTaxNumber: getVal("vendorTaxNumber"),
            vendorVatId: getVal("vendorVatId"),
            vendorTaxNote: getVal("vendorTaxNote"),

            customerName: getVal("customerName"),
            customerCompany: getVal("customerCompany"),
            customerNumber: getVal("customerNumber"),
            customerPerson: getVal("customerPerson"),
            customerStreet: getVal("customerStreet"),
            customerZipCity: getVal("customerZipCity"),
            customerEmail: getVal("customerEmail"),

            notes: getVal("notes"),
            isPaid: getChecked("isPaid"),
            paidDate: getVal("paidDate"),

            items: items
        };
    }

    function applyFormData(data) {
        if (!data) return;

        setVal("docType", data.docType);
        setVal("docNumber", data.docNumber);
        setVal("docDate", data.docDate);
        setVal("paymentTerms", data.paymentTerms);
        setVal("currency", data.currency);
        setVal("customerOrderNumber", data.customerOrderNumber);
        setVal("serviceDateFrom", data.serviceDateFrom);
        setVal("serviceDateTo", data.serviceDateTo);
        setChecked("isKleinunternehmer", data.isKleinunternehmer);

        setVal("bankHolder", data.bankHolder);
        setVal("bankName", data.bankName);
        setVal("bankIban", data.bankIban);
        setVal("bankBic", data.bankBic);
        setVal("bankNote", data.bankNote);

        setVal("vendorName", data.vendorName);
        setVal("vendorCompany", data.vendorCompany);
        setVal("vendorStreet", data.vendorStreet);
        setVal("vendorZipCity", data.vendorZipCity);
        setVal("vendorEmail", data.vendorEmail);
        setVal("vendorPhone", data.vendorPhone);
        setVal("vendorTaxNumber", data.vendorTaxNumber);
        setVal("vendorVatId", data.vendorVatId);
        setVal("vendorTaxNote", data.vendorTaxNote);

        setVal("customerName", data.customerName);
        setVal("customerCompany", data.customerCompany);
        setVal("customerNumber", data.customerNumber);
        setVal("customerPerson", data.customerPerson);
        setVal("customerStreet", data.customerStreet);
        setVal("customerZipCity", data.customerZipCity);
        setVal("customerEmail", data.customerEmail);

        setVal("notes", data.notes);
        setChecked("isPaid", data.isPaid);
        setVal("paidDate", data.paidDate);

        // Positionen neu aufbauen
        $("itemsBody").innerHTML = "";
        if (Array.isArray(data.items) && data.items.length) {
            data.items.forEach(item => addItemRow(item));
        } else {
            addItemRow();
        }
        recalcSums();
    }

    // Browser-Speicher / Datei -------------------------------------------

    function saveToBrowser() {
        const data = collectFormData();
        try {
            localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(data));
            alert("Daten wurden im Browser gespeichert.");
        } catch (e) {
            console.error(e);
            alert("Speichern im Browser ist fehlgeschlagen.");
        }
    }

    function loadFromBrowser() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
            if (!raw) {
                alert("Keine gespeicherten Daten im Browser gefunden.");
                return;
            }
            const data = JSON.parse(raw);
            applyFormData(data);
        } catch (e) {
            console.error(e);
            alert("Laden aus dem Browser ist fehlgeschlagen.");
        }
    }

    function saveToFile() {
        const data = collectFormData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const a = document.createElement("a");
        const docNumber = getVal("docNumber") || "dokument";
        a.download = docNumber.replace(/[^0-9A-Za-z_\-]/g, "_") + ".json";
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function loadFromFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", function () {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);
                    applyFormData(data);
                } catch (err) {
                    console.error(err);
                    alert("Die Datei konnte nicht gelesen werden.");
                }
            };
            reader.readAsText(file, "utf-8");
        });
        input.click();
    }

    // Logo-Handling -------------------------------------------------------

    function initLogo() {
        const logoInput = $("logoInput");
        const logoPreview = $("logoPreview");
        const logoRemove = $("btnLogoRemove");

        // vorhandenes Logo aus localStorage laden
        try {
            const stored = localStorage.getItem(STORAGE_KEY_LOGO);
            if (stored && logoPreview) {
                logoPreview.src = stored;
            }
        } catch (e) {
            console.warn("Logo konnte nicht aus localStorage geladen werden:", e);
        }

        if (logoInput) {
            logoInput.addEventListener("change", function () {
                const file = logoInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function (e) {
                    const dataUrl = e.target.result;
                    if (logoPreview) {
                        logoPreview.src = dataUrl;
                    }
                    try {
                        localStorage.setItem(STORAGE_KEY_LOGO, dataUrl);
                    } catch (err) {
                        console.error(err);
                        alert("Logo konnte nicht im Browser gespeichert werden.");
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        if (logoRemove) {
            logoRemove.addEventListener("click", function () {
                if (logoPreview) {
                    logoPreview.src = "";
                }
                try {
                    localStorage.removeItem(STORAGE_KEY_LOGO);
                } catch (e) {
                    console.error(e);
                }
                if (logoInput) {
                    logoInput.value = "";
                }
            });
        }
    }

    // Drucken / neue Seite öffnen ----------------------------------------

    function openPrintWindow(docTypeForPrint) {
        const data = collectFormData();
        data.docTypeForPrint = docTypeForPrint;

        try {
            localStorage.setItem(STORAGE_KEY_PRINT, JSON.stringify(data));
        } catch (e) {
            console.error(e);
            alert("Daten für den Druck konnten nicht im Browser gespeichert werden.");
            return;
        }

        window.open("doku-light-print.html", "_blank");
    }

    // Initialisierung -----------------------------------------------------

    document.addEventListener("DOMContentLoaded", function () {
        // mindestens eine Position
        addItemRow();

        // Buttons Positionen
        $("btnAddItem")?.addEventListener("click", function () {
            addItemRow();
        });

        $("btnRemoveItem")?.addEventListener("click", function () {
            const tbody = $("itemsBody");
            if (tbody && tbody.lastElementChild) {
                tbody.removeChild(tbody.lastElementChild);
                renumberPositions();
                recalcSums();
            }
        });

        // Kleinunternehmer-Schalter beeinflusst Summen
        $("isKleinunternehmer")?.addEventListener("change", function () {
            recalcSums();
        });

        // Schnellauswahl Zahlungsziel
        document.querySelectorAll(".preset-payment").forEach(btn => {
            btn.addEventListener("click", function () {
                const txt = btn.getAttribute("data-text");
                if (txt) setVal("paymentTerms", txt);
            });
        });

        // Speichern / Laden
        $("btnSaveBrowser")?.addEventListener("click", saveToBrowser);
        $("btnLoadBrowser")?.addEventListener("click", loadFromBrowser);
        $("btnSaveFile")?.addEventListener("click", saveToFile);
        $("btnLoadFile")?.addEventListener("click", loadFromFile);

        // Drucken
        $("btnPrintAngebot")?.addEventListener("click", () => openPrintWindow("angebot"));
        $("btnPrintRechnung")?.addEventListener("click", () => openPrintWindow("rechnung"));
        $("btnPrintLieferschein")?.addEventListener("click", () => openPrintWindow("lieferschein"));
        $("btnPrintBestellung")?.addEventListener("click", () => openPrintWindow("bestellbestätigung"));
        $("btnPrintZahlungserinnerung")?.addEventListener("click", () => openPrintWindow("zahlungserinnerung"));
        $("btnPrintMahnung")?.addEventListener("click", () => openPrintWindow("mahnung"));

        // Logo
        initLogo();
    });
})();
