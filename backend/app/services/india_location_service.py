from typing import List, Dict

INDIA_LOCATIONS: Dict[str, List[str]] = {
    "Andhra Pradesh": [
        "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", 
        "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
    ],
    "Arunachal Pradesh": [
        "Changlang", "East Kameng", "East Siang", "Lohit", "Papum Pare", "Tawang", "Tirap", "West Kameng"
    ],
    "Assam": [
        "Barpeta", "Cachar", "Darrang", "Dibrugarh", "Goalpara", "Golaghat", "Jorhat", 
        "Kamrup", "Lakhimpur", "Nagaon", "Nalbari", "Sonitpur", "Tinsukia"
    ],
    "Bihar": [
        "Araria", "Aurangabad", "Begusarai", "Bhagalpur", "Bhojpur", "Darbhanga", "Gaya", 
        "Gopalganj", "Katihar", "Madhubani", "Muzaffarpur", "Nalanda", "Patna", "Purnia", 
        "Rohtas", "Samastipur", "Saran", "Vaishali"
    ],
    "Chhattisgarh": [
        "Balod", "Bastar", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Janjgir-Champa", 
        "Korba", "Mahasamund", "Raigarh", "Raipur", "Rajnandgaon", "Surguja"
    ],
    "Goa": [
        "North Goa", "South Goa"
    ],
    "Gujarat": [
        "Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Jamnagar", 
        "Junagadh", "Kheda", "Kutch", "Mehsana", "Navsari", "Rajkot", "Sabarkantha", 
        "Surat", "Surendranagar", "Vadodara"
    ],
    "Haryana": [
        "Ambala", "Bhiwani", "Fatehabad", "Hisar", "Jind", "Kaithal", "Karnal", 
        "Kurukshetra", "Panipat", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ],
    "Himachal Pradesh": [
        "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Mandi", 
        "Shimla", "Sirmaur", "Solan", "Una"
    ],
    "Jharkhand": [
        "Bokaro", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Giridih", 
        "Hazaribagh", "Palamu", "Ranchi", "West Singhbhum"
    ],
    "Karnataka": [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bidar", "Chikkamagaluru", 
        "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Hassan", "Haveri", 
        "Kalaburagi", "Mandya", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura"
    ],
    "Kerala": [
        "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", 
        "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
    ],
    "Madhya Pradesh": [
        "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Chhindwara", "Dewas", "Dhar", 
        "Guna", "Gwalior", "Hoshangabad", "Indore", "Jabalpur", "Khargone", "Mandsaur", 
        "Morena", "Raisen", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Shajapur", "Shivpuri", "Ujjain", "Vidisha"
    ],
    "Maharashtra": [
        "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", 
        "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", 
        "Kolhapur", "Latur", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", 
        "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", 
        "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ],
    "Manipur": [
        "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Senapati", "Tamenglong", "Thoubal", "Ukhrul"
    ],
    "Meghalaya": [
        "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
    ],
    "Mizoram": [
        "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"
    ],
    "Nagaland": [
        "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"
    ],
    "Odisha": [
        "Balasore", "Bargarh", "Bhadrak", "Bolangir", "Cuttack", "Dhenkanal", "Ganjam", 
        "Jajpur", "Jharsuguda", "Kalahandi", "Kendrapara", "Kendujhar", "Khordha", "Koraput", 
        "Mayurbhanj", "Puri", "Rayagada", "Sambalpur", "Sundergarh"
    ],
    "Punjab": [
        "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
        "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
        "Mansa", "Moga", "Muktsar", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar", "Tarn Taran"
    ],
    "Rajasthan": [
        "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", 
        "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", 
        "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Kota", 
        "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
    ],
    "Sikkim": [
        "East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"
    ],
    "Tamil Nadu": [
        "Ariyalur", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", 
        "Kanyakumari", "Karur", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", 
        "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", 
        "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Vellore", "Viluppuram", "Virudhunagar"
    ],
    "Telangana": [
        "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Karimnagar", 
        "Khammam", "Mahabubnagar", "Mancherial", "Medak", "Nalgonda", "Nizamabad", 
        "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Warangal", "Yadadri Bhuvanagiri"
    ],
    "Tripura": [
        "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
    ],
    "Uttar Pradesh": [
        "Agra", "Aligarh", "Amroha", "Ayodhya", "Azamgarh", "Bareilly", "Basti", "Bijnor", 
        "Budaun", "Bulandshahr", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", 
        "Firozabad", "Gorakhpur", "Hardoi", "Hathras", "Jaunpur", "Jhansi", "Kanpur", 
        "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Mathura", "Meerut", "Mirzapur", 
        "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", 
        "Rampur", "Saharanpur", "Shahjahanpur", "Sitapur", "Sultanpur", "Unnao", "Varanasi"
    ],
    "Uttarakhand": [
        "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
        "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", 
        "Udham Singh Nagar", "Uttarkashi"
    ],
    "West Bengal": [
        "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", 
        "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Malda", "Murshidabad", "Nadia", 
        "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", 
        "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ],
    "Andaman and Nicobar Islands": [
        "Nicobar", "North and Middle Andaman", "South Andaman"
    ],
    "Chandigarh": [
        "Chandigarh"
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
        "Dadra and Nagar Haveli", "Daman", "Diu"
    ],
    "Delhi": [
        "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
        "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
    ],
    "Jammu and Kashmir": [
        "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", 
        "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", 
        "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
    ],
    "Ladakh": [
        "Kargil", "Leh"
    ],
    "Lakshadweep": [
        "Lakshadweep"
    ],
    "Puducherry": [
        "Karaikal", "Mahe", "Puducherry", "Yanam"
    ]
}

def get_all_states() -> List[str]:
    return sorted(list(INDIA_LOCATIONS.keys()))

def get_districts_for_state(state: str) -> List[str]:
    return INDIA_LOCATIONS.get(state, [])

