export interface LocalSong {
    id: number;
    title: string;
    artist: string;
    movie: string;
    emotion: string;
    audio: any;
    cover: any;
}

const songsDataset: LocalSong[] = [
    {
        id: 1,
        title: "Arabic Kuthu",
        artist: "Anirudh Ravichander",
        movie: "Beast",
        emotion: "happy",
        audio: require("../assets/songs/arabic_kuthu.mp3"),
        cover: require("../assets/covers/beast.jpg")
    },
    {
        id: 2,
        title: "Vaathi Coming",
        artist: "Anirudh Ravichander",
        movie: "Master",
        emotion: "happy",
        audio: require("../assets/songs/vaathi_coming.mp3"),
        cover: require("../assets/covers/master.jpg")
    },
    {
        id: 3,
        title: "Donu Donu Donu",
        artist: "Anirudh Ravichander",
        movie: "Maari",
        emotion: "happy",
        audio: require("../assets/songs/donu_donu.mp3"),
        cover: require("../assets/covers/maari.jpg")
    },
    {
        id: 4,
        title: "Rowdy Baby",
        artist: "Yuvan Shankar Raja",
        movie: "Maari 2",
        emotion: "happy",
        audio: require("../assets/songs/rowdy_baby.mp3"),
        cover: require("../assets/covers/maari2.jpg")
    },
    {
        id: 5,
        title: "Why This Kolaveri",
        artist: "Anirudh Ravichander",
        movie: "3",
        emotion: "sad",
        audio: require("../assets/songs/kolaveri.mp3"),
        cover: require("../assets/covers/3movie.jpg")
    },
    {
        id: 6,
        title: "Po Nee Po",
        artist: "Anirudh Ravichander",
        movie: "3",
        emotion: "sad",
        audio: require("../assets/songs/po_nee_po.mp3"),
        cover: require("../assets/covers/3movie.jpg")
    },
    {
        id: 7,
        title: "Kanave Kanave",
        artist: "Anirudh Ravichander",
        movie: "David",
        emotion: "sad",
        audio: require("../assets/songs/kanave_kanave.mp3"),
        cover: require("../assets/covers/david.jpg")
    },
    {
        id: 8,
        title: "Munbe Vaa",
        artist: "A.R. Rahman",
        movie: "Sillunu Oru Kadhal",
        emotion: "calm",
        audio: require("../assets/songs/munbe_vaa.mp3"),
        cover: require("../assets/covers/sillunu_oru_kadhal.jpg")
    },
    {
        id: 9,
        title: "Vaseegara",
        artist: "Harris Jayaraj",
        movie: "Minnale",
        emotion: "calm",
        audio: require("../assets/songs/vaseegara.mp3"),
        cover: require("../assets/covers/minnale.jpg")
    },
    {
        id: 10,
        title: "Nenjukkul Peidhidum",
        artist: "Harris Jayaraj",
        movie: "Vaaranam Aayiram",
        emotion: "calm",
        audio: require("../assets/songs/nenjukkul_peidhidum.mp3"),
        cover: require("../assets/covers/vaaranam_aayiram.jpg")
    },
    {
        id: 11,
        title: "Pachai Nirame",
        artist: "A.R. Rahman",
        movie: "Alaipayuthey",
        emotion: "calm",
        audio: require("../assets/songs/pachai_nirame.mp3"),
        cover: require("../assets/covers/alaipayuthey.jpg")
    },
    {
        id: 12,
        title: "Neruppu Da",
        artist: "Santhosh Narayanan",
        movie: "Kabali",
        emotion: "angry",
        audio: require("../assets/songs/neruppu_da.mp3"),
        cover: require("../assets/covers/kabali.jpg")
    },
    {
        id: 13,
        title: "Aalaporan Thamizhan",
        artist: "A.R. Rahman",
        movie: "Mersal",
        emotion: "angry",
        audio: require("../assets/songs/aalaporan_thamizhan.mp3"),
        cover: require("../assets/covers/mersal.jpg")
    },
    {
        id: 14,
        title: "Surviva",
        artist: "Anirudh Ravichander",
        movie: "Vivegam",
        emotion: "angry",
        audio: require("../assets/songs/surviva.mp3"),
        cover: require("../assets/covers/vivegam.jpg")
    },
    {
        id: 15,
        title: "Thalli Pogathey",
        artist: "A.R. Rahman",
        movie: "Achcham Yenbadhu Madamaiyada",
        emotion: "surprise",
        audio: require("../assets/songs/thalli_pogathey.mp3"),
        cover: require("../assets/covers/aym.jpg")
    }
];

export default songsDataset;
