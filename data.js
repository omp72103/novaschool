/* NovaSchool — content & configuration.
   Rebrand by editing BRAND. Edit syllabus lists in SYL. All prices in INR. */
window.NS = window.NS || {};

NS.BRAND = {
  name: "NOVASCHOOL", first: "NOVA", second: "SCHOOL", parent: "NOVAEDGE",
  company: "NovaEdge Learning Private Limited",
  tagline: "Next-gen personalised learning",
  tutorName: "Nova, your Personal Tutor",
  phone: "+91 90000 00000", email: "hello@novaschool.in",
  address: "Sector 62, Noida, Uttar Pradesh 201301"
};

/* Optional: point to your own backend (POST {messages} -> {text}) when hosting outside Claude. */
NS.CONFIG = { aiEndpoint: "/api/ai", leadEndpoint: "/api/lead", paymentsLive: false };

NS.BOARDS = [
  { id: "cbse", name: "CBSE", full: "Central Board of Secondary Education" },
  { id: "icse", name: "ICSE", full: "Indian Certificate of Secondary Education" },
  { id: "ib", name: "IB", full: "International Baccalaureate" },
  { id: "cambridge", name: "Cambridge", full: "Cambridge International" }
];
NS.CLASSES = [5, 6, 7, 8, 9, 10, 11, 12];
NS.STREAMS = { PCM: "Physics · Chemistry · Maths", PCB: "Physics · Chemistry · Biology", PCMB: "Physics · Chemistry · Maths · Biology" };

const L = s => s.split("|");
const SYL = {
  maths5: L("The Fish Tale|Shapes and Angles|How Many Squares?|Parts and Wholes|Does it Look the Same?|Be My Multiple, I'll be Your Factor|Can You See the Pattern?|Mapping Your Way|Boxes and Sketches|Tenths and Hundredths|Area and its Boundary|Smart Charts|Ways to Multiply and Divide|How Big? How Heavy?"),
  evs5: L("Our Senses and the Animal World|Food: Where It Comes From|Water: Sources and Uses|Travel and Transport|Homes and Shelters|Seeds, Plants and Growth|Our Body and Health|Caring for Our Environment"),
  maths6: L("Patterns in Mathematics|Lines and Angles|Number Play|Data Handling and Presentation|Prime Time|Perimeter and Area|Fractions|Playing with Constructions|Symmetry|The Other Side of Zero"),
  sci6: L("The Wonderful World of Science|Diversity in the Living World|Mindful Eating: A Path to a Healthy Body|Exploring Magnets|Measurement of Length and Motion|Materials Around Us|Temperature and its Measurement|A Journey through States of Water|Methods of Separation in Everyday Life|Living Creatures: Exploring their Characteristics|Nature's Treasures|Beyond Earth"),
  maths7: L("Integers|Fractions and Decimals|Data Handling|Simple Equations|Lines and Angles|The Triangle and its Properties|Comparing Quantities|Rational Numbers|Perimeter and Area|Algebraic Expressions|Exponents and Powers|Symmetry|Visualising Solid Shapes"),
  sci7: L("The Ever-Evolving World of Science|Exploring Substances: Acidic, Basic and Neutral|Electricity: Circuits and their Components|The World of Metals and Non-metals|Changes Around Us: Physical and Chemical|Adolescence: A Stage of Growth and Change|Heat Transfer in Nature|Measurement of Time and Motion|Life Processes in Animals|Life Processes in Plants|Light: Shadows and Reflections|Earth, Moon and the Sun"),
  maths8: L("A Square and A Cube|Power Play|A Story of Numbers|Quadrilaterals|Number Play|We Distribute, Yet Things Multiply|Proportional Reasoning-1|Fractions in Disguise|The Baudhāyana-Pythagoras Theorem|Proportional Reasoning-2|Exploring Some Geometric Themes|Tales by Dots and Lines|Algebra Play|Area"),
  sci8: L("Exploring the Investigative World of Science|The Invisible Living World: Beyond Our Naked Eye|Health: The Ultimate Treasure|Electricity: Magnetic and Heating Effects|Exploring Forces|Pressure, Winds, Storms and Cyclones|Particulate Nature of Matter|Nature of Matter: Elements, Compounds and Mixtures|The Amazing World of Solutes, Solvents and Solutions|Light: Mirrors and Lenses|Keeping Time with the Skies|How Nature Works in Harmony|Our Home: Earth, a Unique Life Sustaining Planet"),
  eng: L("Reading Comprehension|Grammar: Parts of Speech|Tenses and Verb Forms|Vocabulary Building|Paragraph and Story Writing|Letter and Notice Writing"),
  ss: L("History: Sources and Timelines|Geography: Maps and Our Earth|Resources and their Use|Civics: Government and Democracy|Economy and Livelihoods|Culture and Heritage"),
  comp: L("Computer Fundamentals|Files, Folders and Storage|Word Processing|Spreadsheet Basics|Introduction to Programming with Scratch|Internet Safety and Ethics"),
  maths9: L("Number Systems|Polynomials|Coordinate Geometry|Linear Equations in Two Variables|Introduction to Euclid's Geometry|Lines and Angles|Triangles|Quadrilaterals|Circles|Heron's Formula|Surface Areas and Volumes|Statistics"),
  sci9: L("Matter in Our Surroundings|Is Matter Around Us Pure?|Atoms and Molecules|Structure of the Atom|The Fundamental Unit of Life|Tissues|Motion|Force and Laws of Motion|Gravitation|Work and Energy|Sound|Improvement in Food Resources"),
  ss9: L("The French Revolution|Socialism in Europe and the Russian Revolution|Nazism and the Rise of Hitler|India – Size and Location|Physical Features of India|Drainage|Climate|What is Democracy? Why Democracy?|Constitutional Design|Electoral Politics|The Story of Village Palampur|People as Resource|Poverty as a Challenge|Food Security in India"),
  maths10: L("Real Numbers|Polynomials|Pair of Linear Equations in Two Variables|Quadratic Equations|Arithmetic Progressions|Triangles|Coordinate Geometry|Introduction to Trigonometry|Some Applications of Trigonometry|Circles|Areas Related to Circles|Surface Areas and Volumes|Statistics|Probability"),
  sci10: L("Chemical Reactions and Equations|Acids, Bases and Salts|Metals and Non-metals|Carbon and its Compounds|Life Processes|Control and Coordination|How do Organisms Reproduce?|Heredity|Light – Reflection and Refraction|The Human Eye and the Colourful World|Electricity|Magnetic Effects of Electric Current|Our Environment"),
  ss10: L("The Rise of Nationalism in Europe|Nationalism in India|The Making of a Global World|The Age of Industrialisation|Print Culture and the Modern World|Resources and Development|Water Resources|Agriculture|Minerals and Energy Resources|Manufacturing Industries|Power Sharing|Federalism|Gender, Religion and Caste|Political Parties|Outcomes of Democracy|Development|Sectors of the Indian Economy|Money and Credit|Globalisation and the Indian Economy|Consumer Rights"),
  eng910: L("Reading Comprehension|Writing: Letters and Articles|Grammar: Tenses and Modals|Grammar: Reported Speech|Prose and Poetry Analysis|Literature: Character and Theme"),
  comp910: L("Introduction to Artificial Intelligence|Computer Systems and Networks|Python Basics|Conditionals and Loops|Lists and Strings|Cyber Safety"),
  phy11: L("Units and Measurements|Motion in a Straight Line|Motion in a Plane|Laws of Motion|Work, Energy and Power|System of Particles and Rotational Motion|Gravitation|Mechanical Properties of Solids|Mechanical Properties of Fluids|Thermal Properties of Matter|Thermodynamics|Kinetic Theory|Oscillations|Waves"),
  chem11: L("Some Basic Concepts of Chemistry|Structure of Atom|Classification of Elements and Periodicity in Properties|Chemical Bonding and Molecular Structure|Thermodynamics|Equilibrium|Redox Reactions|Organic Chemistry – Some Basic Principles and Techniques|Hydrocarbons"),
  maths11: L("Sets|Relations and Functions|Trigonometric Functions|Complex Numbers and Quadratic Equations|Linear Inequalities|Permutations and Combinations|Binomial Theorem|Sequences and Series|Straight Lines|Conic Sections|Introduction to Three Dimensional Geometry|Limits and Derivatives|Statistics|Probability"),
  bio11: L("The Living World|Biological Classification|Plant Kingdom|Animal Kingdom|Morphology of Flowering Plants|Anatomy of Flowering Plants|Structural Organisation in Animals|Cell: The Unit of Life|Biomolecules|Cell Cycle and Cell Division|Photosynthesis in Higher Plants|Respiration in Plants|Plant Growth and Development|Breathing and Exchange of Gases|Body Fluids and Circulation|Excretory Products and their Elimination|Locomotion and Movement|Neural Control and Coordination|Chemical Coordination and Integration"),
  phy12: L("Electric Charges and Fields|Electrostatic Potential and Capacitance|Current Electricity|Moving Charges and Magnetism|Magnetism and Matter|Electromagnetic Induction|Alternating Current|Electromagnetic Waves|Ray Optics and Optical Instruments|Wave Optics|Dual Nature of Radiation and Matter|Atoms|Nuclei|Semiconductor Electronics"),
  chem12: L("Solutions|Electrochemistry|Chemical Kinetics|The d- and f-Block Elements|Coordination Compounds|Haloalkanes and Haloarenes|Alcohols, Phenols and Ethers|Aldehydes, Ketones and Carboxylic Acids|Amines|Biomolecules"),
  maths12: L("Relations and Functions|Inverse Trigonometric Functions|Matrices|Determinants|Continuity and Differentiability|Application of Derivatives|Integrals|Application of Integrals|Differential Equations|Vector Algebra|Three Dimensional Geometry|Linear Programming|Probability"),
  bio12: L("Sexual Reproduction in Flowering Plants|Human Reproduction|Reproductive Health|Principles of Inheritance and Variation|Molecular Basis of Inheritance|Evolution|Human Health and Disease|Microbes in Human Welfare|Biotechnology: Principles and Processes|Biotechnology and its Applications|Organisms and Populations|Ecosystem|Biodiversity and Conservation"),
  eng1112: L("Reading Comprehension and Note-making|Writing: Reports, Articles and Speeches|Grammar in Context|Prose: Theme and Style|Poetry: Devices and Meaning|Drama and Supplementary Reading"),
  comp1112: L("Computer Systems and Organisation|Python Fundamentals|Flow of Control|Strings, Lists, Tuples and Dictionaries|Functions and Modules|File Handling|Data Structures: Stacks|Databases and SQL|Computer Networks|Society, Law and Ethics"),
  // ICSE 9–10
  iphy9: L("Measurements and Experimentation|Motion in One Dimension|Laws of Motion|Fluids: Pressure and Upthrust|Heat and Energy|Reflection of Light|Propagation of Sound Waves|Current Electricity|Magnetism"),
  ichem9: L("The Language of Chemistry|Chemical Changes and Reactions|Water|Atomic Structure and Chemical Bonding|The Periodic Table|Study of the First Element – Hydrogen|Study of Gas Laws|Atmospheric Pollution"),
  ibio9: L("Introducing Biology|Cell: The Unit of Life|Tissues|The Flowering Plant|Pollination and Fertilisation|Seeds: Structure and Germination|Respiration in Plants|Five Kingdom Classification|Economic Importance of Bacteria and Fungi|Nutrition|Digestive System|Movement and Locomotion|Skin|Respiratory System|Hygiene and Diseases|Waste Generation and Management"),
  iphy10: L("Force|Work, Power and Energy|Machines|Refraction of Light at Plane Surfaces|Refraction through a Lens|Spectrum|Sound|Current Electricity|Household Circuits|Electromagnetism|Calorimetry|Radioactivity"),
  ichem10: L("Periodic Properties and Variations|Chemical Bonding|Acids, Bases and Salts|Analytical Chemistry|Mole Concept and Stoichiometry|Electrolysis|Metallurgy|Study of Compounds: HCl, Ammonia, Nitric and Sulphuric Acid|Organic Chemistry"),
  ibio10: L("Cell Cycle and Cell Division|Genetics|Absorption by Roots|Transpiration|Photosynthesis|Chemical Coordination in Plants|Circulatory System|Excretory System|Nervous System|Sense Organs|Endocrine System|Reproductive System|Human Evolution|Population|Pollution"),
  ihist: L("The Harappan Civilisation|The Vedic Period|Jainism and Buddhism|The Mauryan Empire|The Indian National Movement|The Two World Wars|The United Nations|Our Constitution|The Union Parliament|The Judiciary"),
  igeo: L("Map Study: Topographical Maps|Map of India|Climate of India|Soil Resources|Natural Vegetation|Water Resources|Mineral and Energy Resources|Agriculture|Manufacturing Industries|Transport and Waste Management"),
  // IB DP
  dphy: L("A.1 Kinematics|A.2 Forces and Momentum|A.3 Work, Energy and Power|A.4 Rigid Body Mechanics|A.5 Galilean and Special Relativity|B.1 Thermal Energy Transfers|B.2 Greenhouse Effect|B.3 Gas Laws|B.4 Thermodynamics|B.5 Current and Circuits|C.1 Simple Harmonic Motion|C.2 Wave Model|C.3 Wave Phenomena|C.4 Standing Waves and Resonance|C.5 Doppler Effect|D.1 Gravitational Fields|D.2 Electric and Magnetic Fields|D.3 Motion in Electromagnetic Fields|D.4 Induction|E.1 Structure of the Atom|E.2 Quantum Physics|E.3 Radioactive Decay|E.4 Fission|E.5 Fusion and Stars"),
  dchem: L("S1.1 Particulate Nature of Matter|S1.2 The Nuclear Atom|S1.3 Electron Configurations|S1.4 The Mole|S1.5 Ideal Gases|S2.1 The Ionic Model|S2.2 The Covalent Model|S2.3 The Metallic Model|S2.4 From Models to Materials|S3.1 The Periodic Table|S3.2 Functional Groups|R1.1 Measuring Enthalpy Changes|R1.2 Energy Cycles|R1.3 Energy from Fuels|R1.4 Entropy and Spontaneity|R2.1 Amount of Chemical Change|R2.2 Rates of Reaction|R2.3 Equilibrium|R3.1 Proton Transfer|R3.2 Electron Transfer|R3.3 Electron Sharing|R3.4 Electron-pair Sharing"),
  dbio: L("A1.1 Water|A1.2 Nucleic Acids|A2.1 Origins of Cells|A2.2 Cell Structure|A2.3 Viruses|A3.1 Diversity of Organisms|A3.2 Classification and Cladistics|A4.1 Evolution and Speciation|A4.2 Conservation of Biodiversity|B1.1 Carbohydrates and Lipids|B1.2 Proteins|B2.1 Membranes|B2.2 Organelles|B2.3 Cell Specialisation|B3.1 Gas Exchange|B3.2 Transport|B3.3 Muscle and Motility|B4.1 Adaptation to Environment|B4.2 Ecological Niches|C1.1 Enzymes|C1.2 Cell Respiration|C1.3 Photosynthesis|C2.1 Chemical Signalling|C2.2 Neural Signalling|C3.1 Integration of Body Systems|C3.2 Defence against Disease|C4.1 Populations and Communities|C4.2 Transfers of Energy and Matter|D1.1 DNA Replication|D1.2 Protein Synthesis|D1.3 Mutation and Gene Editing|D2.1 Cell and Nuclear Division|D2.2 Gene Expression|D2.3 Water Potential|D3.1 Reproduction|D3.2 Inheritance|D3.3 Homeostasis|D4.1 Natural Selection|D4.2 Stability and Change|D4.3 Climate Change"),
  dmath: L("Sequences and Series|Exponents and Logarithms|Proof and the Binomial Theorem|Functions and Graphs|Quadratics and Transformations|Trigonometric Functions|Geometry and Trigonometry in 2D and 3D|Vectors|Statistics|Probability and Distributions|Differentiation|Integration|Kinematics with Calculus|Complex Numbers"),
  // Cambridge
  gphy: L("Physical Quantities and Measurement|Motion|Mass, Weight and Density|Forces and Momentum|Energy, Work and Power|Pressure|Kinetic Particle Model of Matter|Thermal Properties and Temperature|Transfer of Thermal Energy|General Properties of Waves|Light|Electromagnetic Spectrum|Sound|Simple Phenomena of Magnetism|Electrical Quantities and Circuits|Electromagnetic Effects|Nuclear Physics|Space Physics"),
  gchem: L("States of Matter|Atoms, Elements and Compounds|Stoichiometry|Electrochemistry|Chemical Energetics|Chemical Reactions|Acids, Bases and Salts|The Periodic Table|Metals|Chemistry of the Environment|Organic Chemistry|Experimental Techniques and Chemical Analysis"),
  gbio: L("Characteristics and Classification of Living Organisms|Organisation of the Organism|Movement into and out of Cells|Biological Molecules|Enzymes|Plant Nutrition|Human Nutrition|Transport in Plants|Transport in Animals|Diseases and Immunity|Gas Exchange in Humans|Respiration|Excretion in Humans|Coordination and Response|Drugs|Reproduction|Inheritance|Variation and Selection|Organisms and their Environment|Human Influences on Ecosystems|Biotechnology and Genetic Modification"),
  gmath: L("Number|Algebra and Graphs|Coordinate Geometry|Geometry|Mensuration|Trigonometry|Transformations and Vectors|Probability|Statistics"),
  aphy: L("Physical Quantities and Units|Kinematics|Dynamics|Forces, Density and Pressure|Work, Energy and Power|Deformation of Solids|Waves|Superposition|Electricity|D.C. Circuits|Particle Physics|Motion in a Circle|Gravitational Fields|Temperature|Ideal Gases|Thermodynamics|Oscillations|Electric Fields|Capacitance|Magnetic Fields|Alternating Currents|Quantum Physics|Nuclear Physics|Medical Physics|Astronomy and Cosmology"),
  achem: L("Atomic Structure|Atoms, Molecules and Stoichiometry|Chemical Bonding|States of Matter|Chemical Energetics|Electrochemistry|Equilibria|Reaction Kinetics|Chemical Periodicity|Group 2|Group 17|Nitrogen and Sulfur|Introduction to Organic Chemistry|Hydrocarbons|Halogen Compounds|Hydroxy Compounds|Carbonyl Compounds|Carboxylic Acids and Derivatives|Nitrogen Compounds|Polymerisation|Organic Synthesis|Analytical Techniques"),
  amath: L("Quadratics|Functions|Coordinate Geometry|Circular Measure|Trigonometry|Series|Differentiation|Integration|Logarithmic and Exponential Functions|Numerical Solution of Equations|Vectors|Differential Equations|Complex Numbers|Kinematics and Forces|Probability and Statistics"),
  abio: L("Cell Structure|Biological Molecules|Enzymes|Cell Membranes and Transport|The Mitotic Cell Cycle|Nucleic Acids and Protein Synthesis|Transport in Plants|Transport in Mammals|Gas Exchange|Infectious Diseases|Immunity|Energy and Respiration|Photosynthesis|Homeostasis|Control and Coordination|Inheritance|Selection and Evolution|Classification, Biodiversity and Conservation|Genetic Technology")
};
NS.SYL = SYL;

const S = (name, key, icon) => ({ name, key, icon });
/* Returns [{name, slug, icon, chapters:[...]}] for a board/class/stream */
NS.subjectsFor = function (board, cls, stream) {
  cls = +cls; stream = stream || "PCM";
  const pick = list => list.map(s => ({ name: s.name, slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), icon: s.icon, chapters: SYL[s.key] }));
  const scienceStream = (phy, chem, maths, bio, eng, comp) => {
    const out = [S("Physics", phy, "atom"), S("Chemistry", chem, "flask")];
    if (stream !== "PCB") out.push(S("Mathematics", maths, "sigma"));
    if (stream !== "PCM") out.push(S("Biology", bio, "leaf"));
    out.push(S("English", eng, "book")); if (comp) out.push(S("Computer Science", comp, "code"));
    return out;
  };
  const cbse = {
    5: [S("Mathematics", "maths5", "sigma"), S("EVS", "evs5", "leaf"), S("English", "eng", "book"), S("Computer Studies", "comp", "code")],
    6: [S("Mathematics", "maths6", "sigma"), S("Science", "sci6", "flask"), S("English", "eng", "book"), S("Social Science", "ss", "globe"), S("Computer Studies", "comp", "code")],
    7: [S("Mathematics", "maths7", "sigma"), S("Science", "sci7", "flask"), S("English", "eng", "book"), S("Social Science", "ss", "globe"), S("Computer Studies", "comp", "code")],
    8: [S("Mathematics", "maths8", "sigma"), S("Science", "sci8", "flask"), S("English", "eng", "book"), S("Social Science", "ss", "globe"), S("Computer Studies", "comp", "code")],
    9: [S("Mathematics", "maths9", "sigma"), S("Science", "sci9", "flask"), S("English", "eng910", "book"), S("Social Science", "ss9", "globe"), S("Computer Studies", "comp910", "code")],
    10: [S("Mathematics", "maths10", "sigma"), S("Science", "sci10", "flask"), S("English", "eng910", "book"), S("Social Science", "ss10", "globe"), S("Computer Studies", "comp910", "code")]
  };
  if (board === "cbse") {
    if (cls === 11) return pick(scienceStream("phy11", "chem11", "maths11", "bio11", "eng1112", "comp1112"));
    if (cls === 12) return pick(scienceStream("phy12", "chem12", "maths12", "bio12", "eng1112", "comp1112"));
    return pick(cbse[cls]);
  }
  if (board === "icse") {
    if (cls === 9 || cls === 10) return pick([S("Mathematics", "maths" + cls, "sigma"), S("Physics", "iphy" + cls, "atom"), S("Chemistry", "ichem" + cls, "flask"), S("Biology", "ibio" + cls, "leaf"), S("English", "eng910", "book"), S("History & Civics", "ihist", "globe"), S("Geography", "igeo", "globe"), S("Computer Applications", "comp910", "code")]);
    if (cls >= 11) return pick(scienceStream("phy" + cls, "chem" + cls, "maths" + cls, "bio" + cls, "eng1112", "comp1112"));
    return pick(cbse[cls].map(s => s.name === "Social Science" ? S("History, Civics & Geography", s.key, s.icon) : s));
  }
  if (board === "ib") {
    if (cls >= 11) return pick([S("Physics", "dphy", "atom"), S("Chemistry", "dchem", "flask"), S("Biology", "dbio", "leaf"), S("Mathematics: Analysis & Approaches", "dmath", "sigma"), S("English A: Language & Literature", "eng1112", "book")]);
    const base = cbse[Math.min(cls, 10)];
    return pick(base.map(s => S({ "Science": "Sciences", "EVS": "Sciences", "English": "Language & Literature", "Social Science": "Individuals & Societies", "Computer Studies": "Design" }[s.name] || s.name, s.key, s.icon)));
  }
  // cambridge
  if (cls === 9 || cls === 10) return pick([S("Mathematics", "gmath", "sigma"), S("Physics", "gphy", "atom"), S("Chemistry", "gchem", "flask"), S("Biology", "gbio", "leaf"), S("English as a First Language", "eng910", "book"), S("Computer Science", "comp910", "code")]);
  if (cls >= 11) return pick(scienceStream("aphy", "achem", "amath", "abio", "eng1112", "comp1112"));
  return pick(cbse[cls].map(s => s.name === "Social Science" ? S("Global Perspectives", s.key, s.icon) : s));
};
NS.boardStage = (board, cls) => {
  cls = +cls;
  const m = {
    cbse: cls <= 5 ? "Primary" : cls <= 8 ? "Middle School" : cls <= 10 ? "Secondary" : "Senior Secondary",
    icse: cls <= 5 ? "Primary" : cls <= 8 ? "Middle School" : cls <= 10 ? "ICSE" : "ISC",
    ib: cls <= 5 ? "PYP" : cls <= 10 ? "MYP" : "Diploma Programme",
    cambridge: cls <= 5 ? "Primary" : cls <= 8 ? "Lower Secondary" : cls <= 10 ? "IGCSE" : "AS & A Level"
  };
  return m[board];
};

NS.LECTURES = ["Big idea and why it matters", "Core concepts, step by step", "Worked examples", "Recap and quick check"];

NS.LABS = [
  { id: "lens", name: "Convex and Concave Lens", subj: "Physics", cls: "8–12", min: 8, max: 12, desc: "Move an object and watch the ray diagram and image change in real time.", tags: ["Physics"] },
  { id: "pendulum", name: "Simple Pendulum", subj: "Physics", cls: "7–11", min: 7, max: 11, desc: "Change the string length and the planet to see how the swing speeds up or slows down.", tags: ["Physics"] },
  { id: "magnet", name: "Magnetic Field", subj: "Physics", cls: "6–10", min: 6, max: 10, desc: "Drag a bar magnet and watch compass needles and field lines follow.", tags: ["Physics"] },
  { id: "force", name: "Force and Motion", subj: "Physics", cls: "8–11", min: 8, max: 11, desc: "Push a cart and vary force, mass and friction to test Newton's second law.", tags: ["Physics"] },
  { id: "atom", name: "Atom Explorer", subj: "Chemistry", cls: "8–11", min: 8, max: 11, desc: "Build atoms of the first 20 elements and see electrons fill their shells.", tags: ["Chemistry"] },
  { id: "molecule", name: "Molecule Viewer", subj: "Chemistry", cls: "9–12", min: 9, max: 12, desc: "Rotate 3D models of water, carbon dioxide, methane and ammonia.", tags: ["Chemistry"] },
  { id: "particles", name: "States of Matter", subj: "Chemistry", cls: "5–9", min: 5, max: 9, desc: "Heat and cool particles and watch them switch between solid, liquid and gas.", tags: ["Chemistry"] },
  { id: "shadows", name: "Light and Shadows", subj: "Physics", cls: "5–6", min: 5, max: 6, desc: "Move a torch and see shadows grow, shrink and fade.", tags: ["Physics"] },
  { id: "float", name: "Float or Sink", subj: "Physics", cls: "5–6", min: 5, max: 6, desc: "Drop everyday objects into water, then add salt and test again.", tags: ["Physics"] },
  { id: "fraction", name: "Fraction Builder", subj: "Maths", cls: "5–6", min: 5, max: 6, desc: "Shade pizzas and bars to build, simplify and compare fractions.", tags: ["Maths"] },
  { id: "magnetic", name: "Magnetic or Not?", subj: "Physics", cls: "5–6", min: 5, max: 6, desc: "Predict which objects a magnet will pull, then test them.", tags: ["Physics"] },
  { id: "circuit", name: "Simple Circuit", subj: "Physics", cls: "5–6", min: 5, max: 6, desc: "Close the switch and test materials to see which ones light the bulb.", tags: ["Physics"] },
  { id: "moon", name: "Moon Phases", subj: "Space", cls: "5–6", min: 5, max: 6, desc: "Move the Moon around Earth and watch its shape change in our sky.", tags: ["Space"] },
  { id: "water", name: "Water Cycle", subj: "Ocean", cls: "5–6", min: 5, max: 6, desc: "Control sunlight and wind to form clouds and make it rain.", tags: ["Ocean"] },
  { id: "seesaw", name: "See-saw Balance", subj: "Maths", cls: "5–6", min: 5, max: 6, desc: "Place weights on a see-saw and find the balance point.", tags: ["Maths", "Physics"] },
  { id: "solar", name: "Solar System Explorer", subj: "Space", cls: "5–8", min: 5, max: 8, desc: "Watch planets orbit the Sun at relative speeds and compare their years.", tags: ["Space"] },
  { id: "cell", name: "Cell Explorer", subj: "Biology", cls: "6–8", min: 6, max: 8, desc: "Spin plant and animal cells and tap each part to learn what it does.", tags: ["Biology"] },
  { id: "leaf", name: "Photosynthesis Leaf", subj: "Biology", cls: "5–7", min: 5, max: 7, desc: "Supply light, water and CO₂ and watch the leaf release oxygen.", tags: ["Biology"] },
  { id: "ocean", name: "Ocean Explorer", subj: "Ocean", cls: "5–7", min: 5, max: 7, desc: "Dive from the sunlit surface to the deep abyss, then meet and feed the fish.", tags: ["Ocean", "Biology"] }
];
NS.LAB_FILTERS = ["All", "Physics", "Chemistry", "Maths", "Space", "Biology", "Ocean"];
NS.FREE_LABS = ["pendulum", "lens", "magnet"];

NS.PLANS = [
  { id: "starter", name: "Starter", tag: "Try it free", m: 0, y: 0, cta: "Start free",
    feats: ["First lecture of every chapter", "5 AI Tutor questions a day", "3 interactive labs", "Basic progress view"] },
  { id: "scholar", name: "Scholar", tag: "Most popular", m: 699, y: 6699, cta: "Choose Scholar", popular: true,
    feats: ["Every lecture for your class", "Unlimited AI Tutor help", "Voice and chat in English, Hindi and Hinglish", "All interactive labs", "Weekly progress insights"] },
  { id: "achiever", name: "Achiever", tag: "For exam years", m: 1199, y: 11499, cta: "Choose Achiever",
    feats: ["Everything in Scholar", "Chapter tests and mock exams", "Personalised revision plans", "Parent progress reports", "Priority support"] }
];
NS.PLAN_ROWS = [
  ["Lectures", "Chapter 1 of each subject", "All lectures", "All lectures"],
  ["AI Tutor questions", "5 a day", "Unlimited", "Unlimited"],
  ["Voice questions", false, true, true],
  ["Interactive labs", "3 labs", "All 19 labs", "All 19 labs"],
  ["Progress insights", "Basic", "Weekly", "Weekly"],
  ["Chapter tests", false, false, true],
  ["Mock exams", false, false, true],
  ["Revision plans", false, false, true],
  ["Parent progress reports", false, false, true]
];
NS.PLAN_FAQ = [
  ["What happens in the free demo?", "A short live session where your child uses the AI Tutor and a few labs on a topic you pick. Afterwards we help you choose a plan, with no obligation to buy."],
  ["Can we try it before paying?", "Yes. Chapter 1 of every subject is free forever, and the Starter plan includes daily AI Tutor questions and three labs."],
  ["Can I switch or cancel later?", "You can move between plans whenever you like. Cancelling stops the next renewal and you keep access until the period ends."],
  ["Do you offer sibling or school pricing?", "Yes. Ask during the demo for sibling bundles and school licences."]
];

NS.WHY = [
  ["Personalised learning", "Lessons adjust to your class, your speed and what you already know.", "user", "#8b5cf6"],
  ["Instant AI support", "Ask any doubt, any time, and get a clear answer broken into steps.", "chat", "#f97316"],
  ["Curriculum-aligned", "Organised board by board and chapter by chapter, just like school.", "check", "#14b8a6"],
  ["Interactive learning", "Labs and visuals you can drag, tweak and explore.", "pointer", "#3b82f6"],
  ["Stronger fundamentals", "Each idea rests on the one before, so nothing is left shaky.", "layers", "#ec4899"],
  ["Your own pace", "Rewind, slow down or race ahead, with no pressure.", "gauge", "#22c55e"]
];
NS.BLOCKS = [
  ["Knows your syllabus", "Nova starts from your board, class and chapter, so every answer matches what is taught in your classroom."],
  ["Makes it click", "Stories, pictures and quick experiments turn abstract ideas into something you can see."],
  ["Notices where you are", "Stuck? Nova tries a simpler route, a fresh example or smaller steps until it lands."],
  ["Builds from the ground up", "Missing basics are filled in first, so new topics have something solid to stand on."],
  ["Checks understanding", "Short questions at the end confirm the idea has stuck before moving on."]
];
NS.AI_SIDE = ["Available 24/7 at your child's own pace", "Unlimited practice with guided steps", "Explains again, as many times as needed", "Understands English, Hindi and Hinglish", "Clear progress insights for parents"];
NS.TEACHER_SIDE = ["Mentorship and life guidance", "Emotional understanding and care", "Classroom context and discussion", "Guidance on big choices", "Real-world encouragement"];
NS.STEPS = [
  ["Book your demo", "Leave a name and number. It takes less than a minute."],
  ["Experience AI learning", "Try the tutor and labs on any topic you choose."],
  ["You're all set", "Pick a plan and start learning the very same day."]
];

NS.STORIES = [
  ["CBSE · Class 9 · Science", "Placeholder story. Replace with a real quote from a parent, shared with their written permission.", "Parent name", "Parent of a Class 9 student", "City"],
  ["CBSE · Class 10 · Maths", "Placeholder story. Replace with a real quote from a parent, shared with their written permission.", "Parent name", "Parent of a Class 10 student", "City"],
  ["ICSE · Class 8 · Science", "Placeholder story. Replace with a real quote from a parent, shared with their written permission.", "Parent name", "Parent of a Class 8 student", "City"]
];

NS.FAQ = [
  ["What exactly is the Personal Tutor?", "Nova is an AI learning companion that explains concepts, answers doubts step by step and adapts to your child's pace. It supports teachers and parents; it does not replace them."],
  ["Which boards and classes do you cover?", "CBSE, ICSE, IB and Cambridge, for Classes 5 to 12. Classes 11 and 12 can choose PCM, PCB or PCMB."],
  ["Does it follow my child's syllabus?", "Yes. Everything is arranged by board, class, subject and chapter, and the tutor answers in the context of the chapter your child is studying."],
  ["Is it safe for children?", "The tutor is instructed to stay on learning topics, keep a kind tone, avoid personal questions and steer away from anything unsuitable. Parents can review progress any time."],
  ["What data do you collect?", "Only what is needed to run your account: name, board, class, plan, progress and test scores. We never sell data. See our Privacy Policy for details."]
];

NS.BLOG = [
  { id: "science-chapter-by-chapter", cat: "Study tips", date: "12 Nov 2026", mins: 6, featured: true,
    title: "A simple routine for learning Science one chapter at a time",
    body: ["Science chapters feel heavy because they mix new words, diagrams and reasoning all at once. Splitting each chapter into three passes makes it manageable.", "Pass one is for the story: read the chapter like a magazine, without notes, to see where it is going. Pass two is for the words: list every new term and write a one-line meaning in your own words. Pass three is for the reasoning: for each idea, ask why it happens and try to explain it out loud.", "Finish with five short questions from the end of the chapter. If you get stuck, that tells you exactly which section to revisit, which is far more useful than rereading everything."] },
  { id: "ai-tutor-without-copying", cat: "AI and learning", date: "5 Nov 2026", mins: 5,
    title: "Getting real help from an AI tutor (without just copying answers)",
    body: ["An AI tutor is most useful when you treat it like a patient coach rather than an answer key.", "Try the problem first and share your working. Ask for a hint instead of the solution. When you get an answer, ask the tutor to quiz you on the same idea with different numbers.", "Finally, explain the idea back in your own words and ask the tutor to check it. If you can teach it, you have learned it."] },
  { id: "kitchen-chemistry", cat: "Science at home", date: "28 Oct 2026", mins: 4,
    title: "Kitchen experiments that make Chemistry stick",
    body: ["Many chemistry ideas can be seen with things already in your kitchen, with an adult nearby.", "Turmeric water changes colour with soap solution, showing indicators at work. Dissolving sugar in hot and cold water shows how temperature affects solubility. Baking soda and lemon juice fizz because an acid meets a base and releases carbon dioxide.", "Write down what you predict before each test, then compare. That habit is the heart of science."] },
  { id: "pendulum-at-home", cat: "Physics", date: "20 Oct 2026", mins: 5,
    title: "Build a pendulum with a string and a key",
    body: ["Tie a key to a string, hold the other end steady and let it swing. Count how many swings it makes in 30 seconds.", "Now halve the length and count again. The shorter pendulum swings faster, but not twice as fast: the period depends on the square root of the length.", "Compare your numbers with the Simple Pendulum lab, where you can also see what would happen on the Moon or Jupiter."] },
  { id: "spaced-revision", cat: "Study skills", date: "12 Oct 2026", mins: 4,
    title: "Why short, spaced revision beats long cramming sessions",
    body: ["Memory gets stronger each time you recall something just as you are starting to forget it.", "Revise a chapter the day after you learn it, then three days later, then a week later. Each session can be short: ten minutes of self-testing is enough.", "Achiever plans build this schedule for you automatically, based on your test results."] },
  { id: "doubts-are-good", cat: "Study tips", date: "2 Oct 2026", mins: 3,
    title: "Why asking 'silly' doubts is the smartest habit",
    body: ["Most mistakes in exams come from small gaps that were never asked about.", "When something feels unclear, write the doubt down in one sentence. Then ask it, whether to a teacher, a friend or the tutor.", "Over a term, these small questions add up to a big jump in confidence."] }
];

NS.LEGAL = {
  about: { title: "About us", body: [
    ["Our mission", "We believe every student deserves a patient tutor who knows their syllabus. NOVASCHOOL brings together an AI Personal Tutor, chapter-wise lessons and hands-on virtual labs so that students in Classes 5 to 12 can learn at their own pace."],
    ["What we build", "Lessons arranged by board, class and chapter; an AI tutor that explains step by step in English, Hindi or Hinglish; 19 interactive science and maths labs; tests, revision plans and parent reports."],
    ["How we think about AI", "AI is a learning companion. It gives students more practice and more patience, while teachers and parents remain at the centre of a child's learning."],
    ["Who we are", "NOVASCHOOL is a product of NovaEdge Learning Private Limited, based in Noida, Uttar Pradesh."]
  ] },
  "child-safety": { title: "Child safety", body: [
    ["Learning-only tutor", "Nova is instructed to stay on school learning, refuse unsuitable topics and gently redirect off-topic chats."],
    ["No personal questions", "The tutor never asks children for their address, school, photos or contact details."],
    ["Parents stay informed", "Parents can view progress and, on the Achiever plan, receive regular progress reports."],
    ["Report a concern", "Write to us at hello@novaschool.in and we will respond within one working day."]
  ] },
  accessibility: { title: "Accessibility", body: [
    ["Our commitment", "We aim to meet WCAG 2.2 AA. Every page works with a keyboard, has visible focus and readable contrast."],
    ["Labs", "Each lab has text readouts of its key values, so learners who cannot see the animation can still follow the experiment."],
    ["Voice", "Where your browser supports it, students can speak questions and hear answers read aloud."],
    ["Feedback", "If anything is hard to use, email hello@novaschool.in."]
  ] },
  privacy: { title: "Privacy policy", body: [
    ["What we collect", "Name, role, board, class, plan, lecture progress, lab usage, test scores and the questions asked to the tutor."],
    ["Why", "To personalise learning, show progress and run your account. We do not sell personal data or show ads."],
    ["Retention", "You can ask us to delete your account and data at any time."],
    ["Contact", "hello@novaschool.in"]
  ] },
  terms: { title: "Terms of use", body: [
    ["Using the service", "Accounts for students under 18 should be created or supervised by a parent or guardian."],
    ["Plans and billing", "Prices are indicative and confirmed during the demo. Subscriptions renew until cancelled."],
    ["AI answers", "The tutor can make mistakes. Check important answers with a teacher or textbook."],
    ["Acceptable use", "Please use the service for learning, and do not attempt to misuse the tutor."]
  ] },
  cookies: { title: "Cookie policy", body: [
    ["Essential storage", "We store your sign-in and preferences in your browser so the site works."],
    ["No advertising cookies", "We do not use advertising or cross-site tracking cookies."],
    ["Your choice", "Clearing your browser storage signs you out and resets local preferences."]
  ] }
};
