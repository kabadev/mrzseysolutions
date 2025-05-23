import {
  House,
  IdCard,
  Printer,
  Settings,
  Settings2,
  SquarePlus,
  UsersRound,
} from "lucide-react";
import { ChartNoAxesCombined } from "lucide-react";

export const MenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: House,
    isActive: true,
  },
  {
    title: "Passports",
    url: "/passports",
    icon: IdCard,
  },
  {
    title: "Add Passport",
    url: "/add",
    icon: SquarePlus,
  },

  {
    title: "Print",
    url: "/print",
    icon: Printer,
  },
  {
    title: "Users",
    url: "/users/",
    icon: UsersRound,
  },

  {
    title: "Report",
    url: "#",
    icon: ChartNoAxesCombined,
   
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
   
  },
];

export const districts = [
  "Western Urban",
  "Western Rural",
  "Bombali",
  "Bo",
  "Kenema",
  "Kono",
  "Port Loko",
  "Tonkolili",
  "Koinadugu",
  "Kailahun",
  "Moyamba",
  "Pujehun",
  "Falaba",
  "Karene",
  "Bonthe",
];
export const riders = [
  {
    id: "CBR-KA-001",
    surname: "Sangare",
    firstName: "Mariama",
    middleName: "",
    sex: "Female",
    district: "Koinadugu",
    city: "Kabala",
    dateOfBirth: "1990-05-10",
    park: "Kabala Central",
    RIN: "RIN001",
    photo: "/profile.png",
  },
  {
    id: "CBR-KA-002",
    surname: "Kamara",
    firstName: "Abu",
    middleName: "Khalifa",
    sex: "Male",
    district: "Koinadugu",
    city: "Kabala",
    dateOfBirth: "1993-08-15",
    park: "Kabala Central",
    RIN: "RIN002",
    photo: "/moba.jpg",
  },
  {
    id: "CBR-BO-001",
    surname: "Jalloh",
    firstName: "Abdul",
    middleName: "Rahman",
    sex: "Male",
    district: "Bo",
    city: "Bo City",
    dateOfBirth: "1992-11-05",
    park: "Bo Central",
    RIN: "RIN003",
    photo: "isatu.jpg",
  },
  {
    id: "CBR-PL-001",
    surname: "Bamba",
    firstName: "Fatmata",
    middleName: "Nana",
    sex: "Female",
    district: "Port Loko",
    city: "Port Loko Town",
    dateOfBirth: "1995-02-14",
    park: "Port Loko Junction",
    RIN: "RIN004",
    photo:
      "https://newprofilepic2.photo-cdn.net//assets/images/article/profile.jpg",
  },
  {
    id: "CBR-SL-001",
    surname: "Bangura",
    firstName: "Musa",
    middleName: "Saidu",
    sex: "Male",
    district: "Western Area Urban",
    city: "Freetown",
    dateOfBirth: "1990-07-08",
    park: "Lumley Beach",
    RIN: "RIN005",
    photo:
      "https://thumbs.dreamstime.com/b/head-shot-portrait-smiling-businessman-wearing-suit-looking-camera-confident-glasses-profile-picture-successful-executive-204723095.jpg",
  },
  {
    id: "CBR-BO-002",
    surname: "Conteh",
    firstName: "Mariama",
    middleName: "Zainab",
    sex: "Female",
    district: "Bo",
    city: "Bo City",
    dateOfBirth: "1996-04-21",
    park: "Bo Junction",
    RIN: "RIN006",
    photo:
      "https://images.unsplash.com/photo-1536892902862-98a20788bcba?crop=entropy&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "CBR-PL-002",
    surname: "Sheriff",
    firstName: "Sorie",
    middleName: "Bintou",
    sex: "Female",
    district: "Port Loko",
    city: "Lunsar",
    dateOfBirth: "1993-03-30",
    park: "Lunsar Town",
    RIN: "RIN007",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwXuC-R_vPRCVYVw19N6DKXUYM8Ae2St95To_TUF63HuygHYcgCDU8SthpSZTvuA8m6rw&usqp=CAU",
  },
  {
    id: "CBR-SL-002",
    surname: "Sow",
    firstName: "Ibrahim",
    middleName: "Samba",
    sex: "Male",
    district: "Western Area Urban",
    city: "Freetown",
    dateOfBirth: "1991-02-14",
    park: "Tankoro Market",
    RIN: "RIN008",
    photo:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
  },
];
