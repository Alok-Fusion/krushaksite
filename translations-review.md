# Krushak Agricultural Translations Review Notes

This document catalogs agricultural domain terminology and localized phrasing used across English (`en`), Hindi (`hi`), and Marathi (`mr`). While core terminology is calibrated against Maharashtra State Agriculture Department and APMC standards, the following terms should be reviewed with native-speaking agronomists and farmers.

---

## 1. Domain Terminology Mapping

| Concept | English (`en`) | Hindi (`hi`) | Marathi (`mr`) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Agricultural Marketplace** | Farmer Marketplace | किसान बाज़ार | शेतकरी बाजारपेठ | Canonical translation used across navigation and headers |
| **Mandi / APMC** | Mandi / APMC | कृषि उपज मंडी / एपीएमसी | कृषी उत्पन्न बाजार समिती (APMC) | In Maharashtra, "बाजार समिती" is the formal and widely recognized APMC term |
| **Modal Price** | Modal Price | मॉडल भाव | सरासरी बाजारभाव | Average/most frequent transaction rate per quintal |
| **Unit of Weight** | Quintal (q) | क्विंटल | क्विंटल | 1 Quintal = 100 kg. Preserved across all locales |
| **Seeds** | Certified Seeds | प्रमाणित बीज | प्रमाणित बियाणे | "बियाणे" in Marathi, "बीज" in Hindi |
| **Fertilizer** | Fertilizers | उर्वरक / खाद | खते | "खत" (singular) / "खते" (plural) in Marathi |
| **Primary Nutrients** | Urea, DAP, Potash | यूरिया, डीएपी, पोटाश | युरिया, डीएपी, पोटॅश | Standard fertilizer formulations kept phonetically intact |
| **Cropping Seasons** | Kharif / Rabi | खरीफ / रबी | खरीप / रब्बी | Monsoon (खरीप) and Winter (रब्बी) agricultural cycles |
| **Paddy / Rice** | Paddy / Basmati | धान / बासमती | भात / धान / बासमती | In Maharashtra, unhusked rice is traditionally called "भात" or "धान" |
| **Pigeon Pea / Red Gram** | Tur / Arhar | अरहर / तूर | तूर | Major pulse crop in Latur and Vidarbha |
| **Land Lease / Acreage** | Land Listing / Acre | कृषि भूमि / एकड़ | शेतजमीन / एकर | Standard revenue/land record terms in Maharashtra |
| **Produce Arrivals** | Mandi Arrivals | मंडी आवक | बाजार आवक | Quantity of farm produce reaching market yards daily |

---

## 2. Strings Flagged for Native-Speaker Review

1. **"Crop Doctor" vs "पीक डॉक्टर"**:
   - Hindi: *फसल डॉक्टर (एआई)*
   - Marathi: *पीक डॉक्टर (एआई)*
   - *Review note*: Both are widely understood in regional farmer advisories (e.g. Mahadhan, AgroStar). An alternative in Hindi is *फसल वैद्य / पादप रोग निदान*.

2. **"Modal Price" vs "सरासरी दर"**:
   - In APMC circulars, "Modal Price" is the price at which maximum produce traded. In Marathi daily bulletins (e.g., Sakal Agrowon), it is referred to as *"सर्वसाधारण दर"* or *"सरासरी दर"*. We used *"सरासरी दर / मॉडल भाव"*.

3. **Plural Inflections in Shopping Cart**:
   - `{{count}} item` vs `{{count}} items`:
   - Hindi: *{{count}} आइटम* / *{{count}} उत्पाद*
   - Marathi: *{{count}} वस्तू* / *{{count}} उत्पादने*

4. **Machine-Translated Product Descriptions**:
   - All auto-generated translations of user-submitted listings (products, lands) display an attribution pill (*"Translated from Marathi"* / *"मराठीतून अनुवादित"*) with a *"Show original"* toggle, ensuring transparency until manual seller verification.
