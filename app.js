// Importation des modules nécessaires
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Importation des fichiers contenant les modèles et les middlewares
const my = require("./config/database");
const lk = require("./models/user");
const lks = require("./models/questions");
const answers = require("./models/answer");
const resultat = require("./models/result");
const userMiddleware = require("./middlewares/user");
const questionsMiddleware = require("./middlewares/questions");
const answersMiddleware = require("./middlewares/correct");

// Port
const PORT = process.env.PORT || 3000;

// Initialisation de l'application
const app = express();

// Configuration du moteur de template
app.set("view engine", "ejs");

// Configuration de l'application
app.set("trust proxy", 1);
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    session({
        secret: "uneclesecrete", // clé secrète pour les sessions
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false, expires: new Date("2023-12-31")},
    })
);

// Utilisation des middlewares
app.use(userMiddleware);
app.use(questionsMiddleware);
app.use(answersMiddleware);

// Définition des constantes
const saltRounds = 10;
const myPlaintextPassword = "sXDLOLO0//D";

// Route de la page d'accueil
app.get("/", (req, res) => {
    // Recherche aléatoire de questions
    lks.random((u) => {
        // Enregistrement des informations de session
        req.session.questions = u.map((d) => d.id);
        req.session.answer = u.map((d) => d.correct);
        req.session.number = 0;
        req.session.nbques = u.length;
        req.session.correct = 0;

        // Affichage de la page d'accueil
        res.render("pages/index");
    });
});

// Route de création d'utilisateur
app.post("/username", (req, res) => {
    // Vérification que le nom d'utilisateur est valide
    if (req.body.username === undefined || req.body.username === "") {
        console.log("Le nom d'utilisateur est invalide.");
        res.redirect("/inscription");
    } else {
        // Cryptage du mot de passe
        const hash = bcrypt.hashSync(req.body.password, saltRounds);

        // Création de l'utilisateur dans la base de données
        lk.create(hash, req.body.username, () => {
            console.log("Nouvel utilisateur créé : " + req.body.username);
        });

        // Enregistrement des informations de session
        req.session.username = req.body.username;

        // Redirection vers la page d'accueil
        res.redirect("/");
    }
});
// Route de la page d'accueil de l'utilisateur
app.get("/acceuil", (req, res) => {
    let p = [];

    // Recherche de toutes les réponses
    answers.all((h) => {
        p = h;
    });

// Recherche de toutes les questions
    lks.all((u) => {
        // Affichage de la page d'accueil de l'utilisateur
        res.render("pages/acceuil", {posts: u, answers: p});
    });
});

// Affiche le formulaire de création d'une question
app.get("/formquestion", (req, res) => {
    res.render("pages/formquestion");
});

// Crée une nouvelle question avec les informations envoyées via le formulaire
app.post("/form", (req, res) => {
// Création de la question
    lks.create(req.body.content, req.body.theme, 0, () => {
        console.log("Nouvelle question créée avec succès");
    });
// Création d'une réponse vide associée à cette question
    answers.create(req.body.content, req.body.theme, 0, () => {
        console.log("Nouvelle réponse créée avec succès");
    });

// Redirection de l'utilisateur vers la page d'accueil
    res.redirect("/acceuil");

// Création d'une réponse vide associée à cette question
    answers.create(req.body.content, req.body.theme, 0, () => {
        console.log("Nouvelle réponse créée avec succès");
    });

// Redirection de l'utilisateur vers la page d'accueil
    res.redirect("/acceuil");
});

// Route de la session de quizz
app.get("/quizz", (req, res) => {
    // On récupère la question correspondant à la position actuelle de l'utilisateur dans le quizz
    lks.find(req.session.questions[req.session.number], (question) => {
        // On récupère toutes les réponses possibles pour la question en cours
        answers.find(question._id, (answers) => {
            // Affichage de la page de la session de quizz avec la question et les réponses
            res.render("pages/session", {locals: question, answers: answers});

            // Log de la récupération de la question
            console.log("Question récupérée avec succès");

            // Log de la récupération des réponses
            console.log("Réponses récupérées avec succès");
        });
    });
});


// Route pour soumettre la réponse à la question en cours
app.post("/quizz", (req, res) => {
// Vérification de la réponse fournie par l'utilisateur et incrémentation du compteur de réponses correctes si elle est correcte
    if (req.body.answer == req.session.answer[req.session.number]) {
        req.session.correct++;
    }
    // Passage à la question suivante
    req.session.number++;

// Si l'utilisateur n'a pas encore répondu à toutes les questions, on le redirige vers la prochaine question
    if (req.session.number < req.session.nbques) {
        res.redirect("/quizz");
    } else {
        // Sinon, enregistrement du résultat de l'utilisateur dans la base de données et redirection vers la page des résultats
        resultat.create(req.session.username, req.session.nbques, req.session.correct, () => {
            console.log("Résultat enregistré avec succès dans la base de données");
        });
        res.redirect("/formresultat");
        console.log("Nombre de réponses correctes: " + req.session.correct);
    }
});

// Route pour afficher les résultats du quizz
app.get("/formresultat", (req, res) => {
    res.render("pages/result", {
        score: req.session.correct,
        total: req.session.nbques,
    });
});

// Route pour l'arrêt du quizz
app.post("/arret", (req, res) => {
// Enregistrement du résultat de l'utilisateur dans la base de données
    resultat.create(
        req.session.username,
        req.session.nbques,
        req.session.correct,
        () => {
            console.log("Résultat enregistré avec succès");
        }
    );
// Redirection de l'utilisateur vers la page des résultats
    res.redirect("/formresultat");
});

// Route pour soumettre la réponse à la question en cours
app.post("/quizz", (req, res) => {
// Vérification si la réponse fournie par l'utilisateur est correcte
    if (req.body.answer === req.session.answer[req.session.number]) {
// Incrémenter le compteur de réponses correctes si la réponse est correcte
        req.session.correct++;
    }
// Passer à la question suivante
    req.session.number++;
// Si l'utilisateur n'a pas encore répondu à toutes les questions, on le redirige vers la prochaine question
    if (req.session.number < req.session.nbques) {
        res.redirect("/quizz");
    } else {
// Enregistrement du résultat de l'utilisateur dans la base de données et redirection vers la page des résultats
        resultat.create(
            req.session.username,
            req.session.nbques,
            req.session.correct,
            () => {
                console.log("Résultat enregistré avec succès");
                console.log(`Score de l'utilisateur : ${req.session.correct}`);
                res.redirect("/formresultat");
            }
        );
    }
});

// Route pour afficher les résultats de tous les utilisateurs
app.get('/resultotal', (req, res) => {
// Recherche de tous les résultats de quizz enregistrés dans la base de données
    resultat.all((results) => {
// Affichage de la page des résultats de tous les utilisateurs
        res.render("pages/totalresult", {users: results});
    })
});

// Route pour soumettre une recherche de résultats
app.post("/resultotal", async (req, res) => {
// Recherche de tous les résultats de quizz enregistrés dans la base de données
    resultat.all((results) => {
// Affichage de la page des résultats de tous les utilisateurs
        res.render("pages/totalresult", {users: results});
    })
});

// Route pour l'inscription d'un nouvel utilisateur
app.get('/inscription', (req, res) => {
// Affichage du formulaire d'inscription
    res.render('pages/formuser')
})

// Route de déconnexion
app.get("/logout", (req, res) => {
    // Suppression de la session
    req.session.destroy((err) => {
        if (err) {
            console.log("Erreur lors de la déconnexion :", err);
        }
        // Redirection vers la page d'accueil
        res.redirect("/");
    });
});

// Route pour afficher le formulaire de connexion
app.get('/login', (req, res) => {
    res.render('pages/login');
});

// Route pour gérer la soumission du formulaire de connexion
app.post('/login', async (req, res) => {
    // Recherche de l'utilisateur dans la base de données
    const user = await lk.find(req.body.username);
    // Si l'utilisateur n'existe pas, on redirige vers la page de connexion
    if (!user) {
        console.log("Utilisateur inconnu");
        return res.redirect('/login');
    }

    // Vérification que le mot de passe fourni correspond à celui de l'utilisateur
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    // Si le mot de passe est incorrect, on redirige vers la page de connexion
    if (!isPasswordCorrect) {
        console.log("Mot de passe incorrect");
        return res.redirect('/login');
    }

    // Enregistrement des informations de session
    req.session.username = req.body.username;
    console.log("Utilisateur connecté :", req.session.username);

    // Redirection vers la page d'accueil
    res.redirect('/acceuil');
});


// On lance l'application sur le port 3000
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});