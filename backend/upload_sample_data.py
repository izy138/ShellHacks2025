import requests

# Change this if your server is running elsewhere
BASE_URL = "http://127.0.0.1:8000/api"

# Example major data
major_data = {
    "major_id": "COMPSC:BS",
    "name": "Bachelor of Science in Computer Science",
    "required_courses": [
        "MAC1105", "BSC2010", "BSC2010L", "ENC1101", "ENC1102", "MAC1140", "COP2210", "MAC1114", "MAC2311", "BSC2011", "BSC2011L", "MAC2312", "STA3033", "CGS1920", "COT3100", "ENC3249", "COP3337", "CDA3102", "CGS3095", "COP4338", "CEN4010", "CNT4713", "COP3337", "COP3530", "COP4338", "COP4555", "COP4610", "CIS3950", "CIS4951"
    ]
}

# Example course data
courses_data = [
    {
        "code": "MAC1105",
        "name": "College Algebra",
        "description": "In this course, students will develop problem solving skills, critical thinking, computational proficiency, and contextual fluency through the study of equations, functions, and their graphs. Emphasis will be placed on quadratic, exponential, and logarithmic functions. Topics will include solving equations and inequalities, definition and properties of a function, domain and range, transformations of graphs, operations on functions, composite and inverse functions, basic polynomial and rational functions, exponential and logarithmic functions, and applications.",
        "credits": 3
    }, {
        "code": "MAC1140",
        "name": "PreCalc Algebra",
        "description": "Covers polynomial, rational, exponential and logarithmic functions: zeros of polynomials; conic sections; determinant and Cramer¿s rule; sequences and series; induction; binomial theorem. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Students cannot receive credits for both this course and MAC 1147.",
        "credits": 3,
        "prereqs": ["MAC1105"]
    }, {
        "code": "MAC1147",
        "name": "PreCalc Algebra and Trig",
        "description": "Polynomials, rational, exponential and logarithmic functions, trigonometry, conic sections, Cramer's rule, sequences and series, induction, binomial theorem. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Student cannot receive credit for both this course and MAC 1140 and/or MAC 1114.",
        "credits": 4,
        "prereqs": ["MAC1105"]
    }, {
        "code": "MAC1114",
        "name": "Trigonometry",
        "description": "Trigonometric functions, identities, conditional equations, polar coordinates, vectors, polar graphs, complex numbers, DeMoivres theorem, conic sections. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Student cannot receive credit for both this course and MAC 1147 pre-calculus.",
        "credits": 4,
        "prereqs": ["MAC1105"]
    }, {
        "code": "MAC2233",
        "name": "Applied Calc",
        "description": "Basic notions of differential and integral calculus using business applications and models including: differential and integral calculus using polynomials, exponential and logarithmic functions.",
        "credits": 4,
        "prereqs": ["MAC1105"]
    }, {
        "code": "MAC2311",
        "name": "Calc I",
        "description": "In this course, students will develop problem solving skills, critical thinking, computational proficiency, and contextual fluency through the study of limits, derivatives, and definite and indefinite integrals of functions of one variable, including algebraic, exponential, logarithmic, and trigonometric functions, and applications. Topics will include limits, continuity, differentiation and rates of change, optimization, curve sketching, and introduction to integration and area.",
        "credits": 4,
        "prereqs": ["MAC1140", "MAC1114"],
    }, {
        "code": "MAC2312",
        "name": "Calc II",
        "description": "Applications of the integral, integration techniques, improper integrals, Riemann sums, the integral, Fundamental Theorem of Calculus, infinite series, Taylor series, polar coordinates, parametric equations.",
        "credits": 4,
        "prereqs": ["MAC2311"]
    }, {
        "code": "MAC2313",
        "name": "Multivariable Calc",
        "description": "This course deals with the differential and integral calculus of real valued multivariable functions. The topics include: directional and partial derivatives, gradients, and their applications; differential calculus of vector valued functions; multiple, iterated, line, and surface integrals.",
        "credits": 4,
        "prereqs": ["MAC2312"]
    }, {
        "code": "BSC2010",
        "name": "Gen Bio I",
        "description": "In this course students will apply the scientific method to critically examine and explain the natural world. This course will cover molecular biology, cellular biology, genetics, metabolism, and replication. Concurrent registration in both lecture and laboratory is required.",
        "credits": 3,
        "prereqs": ["BSC2010L"],
        "coreqs": ["BSC2010L"]
    }, {
        "code": "BSC2010L",
        "name": "Gen Bio I Lab",
        "description": "Biomolecules, cells, energy flow, genetics, and physiology. Science background or Biology major recommended.",
        "credits": 1,
        "prereqs": ["BSC2010"],
        "coreqs": ["BSC2010"]
    }, {
        "code": "CHM1025",
        "name": "Fundamentals of Chem",
        "description": "ntroduces students to basic mathematics required in chemistry, nature of matter, atomic structure, simple chemical reactions and stoichiometry.",
        "credits": 3,
    }, {
        "code": "CHM1045",
        "name": "Gen Chem I",
        "description": "This course is designed for students pursuing careers in the sciences or who need a more rigorous presentation of chemical concepts than is offered in an introductory course. Students will engage in problem solving and critical thinking while applying chemical concepts. Topics will include the principles of chemistry including atomic theory, electronic and molecular structure, measurement, stoichiometry, bonding, periodicity, thermochemistry, nomenclature, solutions, and the properties of gases. Concurrent registration in both lecture and laboratory is required. (Lab fees assessed)",
        "credits": 3,
        "prereqs": ["MAC1105", "CHM1045L"],
        "coreqs": ["CHM1045L"]
    }, {
        "code": "CHM1045L",
        "name": "Gen Chem I Lab",
        "description": "Fundamental principles of general chemistry: states of matter, atomic structure, stoichiometry, chemical bonding, acid-base reactions, and gas laws. Concurrent registration in both lecture and laboratory is required. (Lab fees assessed)",
        "credits": 1,
        "prereqs": ["CHM1045"],
        "coreqs": ["CHM1045"]
    }, {
        "code": "ESC1000",
        "name": "Intro to Earth Sciences",
        "description": "Using the scientific method, critical thinking skills, and data analysis, this course will examine the fundamental processes of the earth system, composed of an atmosphere, hydrosphere, lithosphere, biosphere, and exosphere, through time. The course will also explore interactions between these spheres, including critical analysis of scientific theories and emphasize earth's connections with humans. Students cannot get credit for both this course and GLY1010.",
        "credits": 3,
    }, {
        "code": "PHY2048",
        "name": "Physics w/Calc I",
        "description": "This calculus-based course serves as the first in a two-part series, covering topics like kinematics, dynamics, energy, momentum, rotational motion, fluid dynamics, oscillatory motion, and waves. Designed for science and engineering majors, the course integrates critical thinking, analytical skills, and real-world applications.",
        "credits": 4,
        "prereqs": ["PHY2048L", "MAC2311"],
        "coreqs": ["PHY2048L"]
    }, {
        "code": "PHY2053",
        "name": "Physics w/o Calc I",
        "description": "This course is the first in a two-part series intended for non-physics majors, offering an algebra and trigonometry approach to topics such as kinematics, dynamics, energy, momentum, rotational motion, fluid dynamics, oscillatory motion, and waves. The course fosters analytical and critical thinking skills to promote a scientific understanding of the real world.",
        "credits": 4
    }, {
        "code": "PHY2048L",
        "name": "Gen Physics Lab I",
        "description": "Laboratory sections of PHY 2048, 2049, PHY 2053, 2054.",
        "credits": 1,
        "prereqs": ["PHY2048"],
        "coreqs": ["PHY2048"]
    }, {
        "code": "BSC2011",
        "name": "Gen Bio II",
        "description": "This course explores the question, what is life? Students will critically examine how microbes, plants, and animals are adapted to their environment, how they function, and how they interact with each other. Students will analyze the branches of the tree of life and learn how to reconstruct the evolution of this vast biodiversity, how it benefits us, and how it can be conserved and sustained. Throughout the course, students will develop scientific inquiry skills by analyzing evidence about the natural world. Concurrent registration in both lecture and lab is required.",
        "credits": 3,
        "prereqs": ["BSC2011L"],
        "coreqs": ["BSC2011L"]
    }, {
        "code": "BSC2011L",
        "name": "Gen Bio Lab II",
        "description": "A survey of organismal biology with emphasis on botany and zoology. Science background or Biology major recommended. (Lab fees assessed)",
        "credits": 1,
        "prereqs": ["BSC2011"],
        "coreqs": ["BSC2011"]
    }, {
        "code": "GLY3039",
        "name": "Environmental Geology",
        "description": "The composition and structure of the earth, the internal and external forces acting upon it and the resulting surface features. Case studies and general principles illustrated from South Florida and the Caribbean. Field trips expected. No prerequisites.",
        "credits": 3
    }, {
        "code": "GLY3039L",
        "name": "Environmental Geology Lab",
        "description": "The composition and structure of the earth, the internal and external forces acting upon it and the resulting surface features. Case studies and general principles illustrated from South Florida and the Caribbean. Field trips expected. No prerequisites.",
        "credits": 1
    }, {
        "code": "PHY2049",
        "name": "Physics w/Calc II",
        "description": "Second in basic physics with calculus sequence. Covers electricity and magnetism, field theory, geometrical and wave optics. PHZ 2103 strongly recommended for problem solving skills. Calculus II (MAC 2312 or equivalent) should be taken prior to or concurrent with this course. Prerequisites: PHY 2048, MAC 2312 or equivalent. Corequisite: MAC 2312 or equivalent.",
        "credits": 4,
        "prereqs": ["PHY2048", "MAC2312"],
        "coreqs": ["MAC2312"]
    }, {
        "code": "PHY2054",
        "name": "Physics w/o Calc II",
        "description": "Second in basic physics without calculus sequence. Covers electricity and magnetism, geometrical and wave optics and the structure of matter. PHY2166 strongly recommended for problem solving skills.",
        "credits": 4,
        "prereqs": ["PHY2053"]
    }, {
        "code": "PHY2049L",
        "name": "Gen Physics Lab II",
        "description": "Laboratory sections of PHY 2048, 2049, PHY 2053, 2054.",
        "credits": 1,
        "prereqs": ["PHY2049"],
        "coreqs": ["PHY2049"]
    }, {
        "code": "CGS1920",
        "name": "Intro to Computing",
        "description": "Overview of the computing field to students, research programs and career options.",
        "credits": 1
    }, {
        "code": "COP1000",
        "name": "Intro to Computer Programming",
        "description": "Uses graphics and animation in a media programming environment to teach problem solving and programming concepts to students with no prior experience. May not be taken after COP 2210 or COP 2250.",
        "credits": 3
    }, {
        "code": "IDC1000",
        "name": "CS for Everyone",
        "description": "Introduction to the breadth and excitement of computing, including its social context, computing principles, and relevance to all disciplines.",
        "credits": 3
    }, {
        "code": "COP2210",
        "name": "Programming I",
        "description": "A first course in computer science that uses a structured programming language to study programming and problem solving on the computer. Includes the design, construction and analysis of programs. Student participation in a closed instructional lab is required. This course will have additional fees.",
        "credits": 4,
        "prereqs": ["MAC1140"]
    }, {
        "code": "COP2250",
        "name": "Java Programming",
        "description": "A first course in programming for IT majors. Syntax and semantics of Java. Classes and Objects. Object oriented program development. Not acceptable for credit for Computer Science majors. This course will have additional fees.",
        "credits": 3
    }, {
        "code": "EEL2880",
        "name": "C Programming for Emb Sys",
        "description": "Engineering problem solving process, overview of a generalized computing system, software development, real-life engineering applications, computational implications.",
        "credits": 3
    }, {
        "code": "COT3100",
        "name": "Discrete Structures",
        "description": "Align mathematical and computational concepts by applying computing to propositional logic, sets, functions relations, induction, recursion, combinatorics, Boolean algebra, graph and trees. Prerequisites: MACXXXX Corequisites: (COP2210 or COP2250 or EEL2880)",
        "credits": 3,
        "prereqs": ["MAC1105"],
        "coreqs": ["COP2210"]
    }, {
        "code": "MAD2104",
        "name": "Discrete Mathematics",
        "description": "Sets, functions, relations, permutations, and combinations, propositional logic, matrix algebra, graphs and trees, Boolean algebra, switching circuits.",
        "credits": 3,
        "prereqs": ["MAC1105"]
    }, {
        "code": "ENC1101",
        "name": "Writing and Rhetoric I",
        "description": "This course introduces students to rhetorical concepts and audience-centered approaches to writing including composing processes, language conventions and style, and critical analysis and engagement with written texts and other forms of communication. Written work meets the state composition requirement. Completion of this course with a grade of C or better is linked to earning the Florida Public Postsecondary Fundamentals of Written Communication digital badge.",
        "credits": 3
    }, {
        "code": "ENC1102",
        "name": "Writing and Rhetoric II",
        "description": "The second in a two-course sequence expands upon the writing and rhetorical strategies learned in ENC1101 and furthers students abilities to write and research arguments. Written work meets the state composition requirement. Completion of this course with a grade of C or better is linked to earning the Florida Public Postsecondary Fundamentals of Written Communication digital badge.",
        "credits": 3,
        "prereqs": ["ENC1101"]
    }, {
        "code": "ENC2304",
        "name": "Writing for Transfer Students",
        "description": "A course in the techniques of written exposition, argumentation, and research. The course is a prerequisite for transfer students (entering with 30 or more credits) taking further ENC classes. Written work meets the state composition requirement. Prerequisite: Transfer student.",
        "credits": 3
    }, {
        "code": "ENC3249",
        "name": "Prof. & Techn. Writing for CS",
        "description": "Introduces students to the expectations of written and verbal communication in the computer science profession; explores the ways in which technology and media help shape professional communication.",
        "credits": 3,
        "prereqs": ["ENC1102"]
    }, {
        "code": "ENC3213",
        "name": "Prof. & Techn. Writing",
        "description": "Principles and practices of effective workplace writing. Students learn audience analysis in order to become more effective writers. Genres include memos, business letters, proposals, and reports. Written work meets the state composition requirement.",
        "credits": 3,
        "prereqs": ["ENC1101", "ENC1102"]
    }, {
        "code": "COP3337",
        "name": "Computer Programming II",
        "description": "An intermediate level course in Object Oriented programming. Topics include primitive types, control structures, strings arrays, objects and classes, data abstraction inheritance polymorphism and an introduction to data structures. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2210"],
        "coreqs": ["COP2210"]
    }, {
        "code": "CDA3102",
        "name": "Computer Architecture",
        "description": "Covers the levels of organization in a computer; digital logic; machine and assembly language programming, design of memory, buses, ALU, CPU; virtual memory, I/O.Prerequisite: COP 3337 and (COT 3100 or MAD 2104).",
        "credits": 3,
        "prereqs": ["COP3337", "COT3100"]
    }, {
        "code": "COP2047",
        "name": "Python Programming I",
        "description": "Introduction to computer programming using Python including fundamental concepts and systematic design techniques. Students will write programs that computationally solve and reduce problems.",
        "credits": 3,
    }, {
        "code": "COP3045",
        "name": "Python Programming II",
        "description": "Object-oriented principles, handling modules, packages, and decorators, working with databases, data structures, and visualization tools. More complex Pythonic solutions for real-world challenges. Prerequisite: COP 2047 or COP 2210 or COP 2250 Corequisite: COP 3410",
        "credits": 3,
        "prereqs": ["COP2047"],
        "coreqs": ["COP3410"]
    }, {
        "code": "COP3410",
        "name": "Computational Thinking",
        "description": "Computational thinking principles, covering algorithms, data structures, problem-solving, problem decomposition, creativity, and topics in recursion and ethical considerations in computing. Prerequisites: COP 2047 or COP 2210 or COP 2250 or Advisor's Permission.",
        "credits": 3,
        "prereqs": ["COP2047"]
    }, {
        "code": "CGS3095",
        "name": "Technology in the Global Arena",
        "description": "Legal, ethical, social impacts of computer technology on society, governance, quality of life: intellectual property, privacy, security, professionalism, social identity in the U.S. and globally. Prerequisites: (COP 2250 or COP 2210 or COP 2047) and (ENC 3249 or ENC 3213). This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2250", "ENC3249"]
    }, {
        "code": "CEN4010",
        "name": "Software Eng I",
        "description": "Software Process Model, software analysis and specification, software design, testing. Prerequisites: CGS3095 and COP 3337",
        "credits": 3,
        "prereqs": ["CGS3095", "COP3337"]
    }, {
        "code": "COP4338",
        "name": "Systems Programming",
        "description": "Programming in C and advanced programming in Unix environments, including multiprocessing and multithreading. This course will have additional fees.",
        "credits": 3,
        "coreqs": ["COP3530"]
    }, {
        "code": "COP3530",
        "name": "Data Structures",
        "description": "Basic concepts of data organization, running time of a program, abstract types, data structures including linked lists, nary trees, sets and graphs, internal sorting. This course will have additional fees. Prerequisites: COP 3337 and (MAD 2104 or COT 3100)",
        "credits": 3,
        "prereqs": ["COP3337", "COT3100"]
    }, {
        "code": "COP3538",
        "name": "Data Structures Fundamentals",
        "description": "Basic concepts of running time of a program, data structures including lists, stacks, queues, binary search trees, and hash tables, and internal sorting. Not acceptable for credit for CS majors. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP3410", "COP3045"]
    }, {
        "code": "CNT4713",
        "name": "Net-centric Computing",
        "description": "This course covers networking fundamentals, network security, network applications, mobile and wireless computing. The course focuses on network programming, including sockets and web programming concepts.",
        "credits": 3,
        "prereqs": ["COP4338"]
    }, {
        "code": "COP4555",
        "name": "Principles of Prog. Langs.",
        "description": "A comparative study of several programming languages and paradigms. Emphasis is given to design, evaluation and implementation. Programs are written in a few of the languages. This course will have additional fees. Prerequisite: COP 3530 or COP 3538",
        "credits": 3,
        "prereqs": ["COP3530"]
    }, {
        "code": "CDA3103",
        "name": "Fundamentals of Computer Systems",
        "description": "Overview of computer systems organization. Data representation. Machine and assembly language programming. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2210"]
    }, {
        "code": "CDA4101",
        "name": "Structured Computer Organization",
        "description": "Covers the levels of organization in a computer: Design of memory, buses, ALU, CPU; design of microprogram. Covers virtual memory, I/O, multiple processes, CISC, RISC and parallel architectures. Prerequisites: CDA 3103, COP 3337 and (MAD 2104 or COT 3100).",
        "credits": 3,
        "prereqs": ["CDA3103", "COP3337", "MAD2104"]
    }, {
        "code": "COP4610",
        "name": "OS Principles",
        "description": "Operating systems design principles and implementation techniques. Address spaces, system call interface, process/threads, interprocess communication, deadlock, scheduling, memory, virtual memory, I/O, file systems. Prerequisites: COP 4338 AND (CDA 3102 OR CDA 4101) This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP4338", "CDA3102"]
    }, {
        "code": "STA3033",
        "name": "Intro to Prob & Stats for CS",
        "description": "Basic probability laws, probability distributions, basic sampling theory, point and interval estimation, tests of hypotheses, regression and correlation.",
        "credits": 3,
        "prereqs": ["MAC2312"]
    }, {
        "code": "COP3804",
        "name": "Intermediate Java Programming",
        "description": "A second course in Java programming. Continues Programming in Java by discussing object-oriented programming in a more detail, with larger programming projects and emphasis on inheritance. Not acceptable for credit for CS majors. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2250"]
    }, {
        "code": "CIS3950",
        "name": "Capstone I",
        "description": "Students learn how to perform efficiently in Agile/Scrum teams of up to 5 members and learn how to design and implement solutions to problems as a team. Prerequisite: (COP 3337 or COP 3804 or COP 3045) and Junior Standing",
        "credits": 3,
        "prereqs": ["COP3337"]
    }, {
        "code": "CIS4951",
        "name": "Capstone II",
        "description": "Students work on faculty supervised projects in teams of up to 5 members to design and implement solutions to problems utilizing knowledge obtained across the spectrum of Computer Science courses. Prerequisite: CIS 3950 and Senior Standing.",
        "credits": 3,
        "prereqs": ["CIS3950"]
    }
]

# locations list in the order you provided
locations = [
    {"code": "ACC",     "full_name": "Ambulatory Care Center",                                      "address": "800 SW 108th Ave, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJU0dla6i_2YgRa2IK5eURHLw"},
    {"code": "AHC1",    "full_name": "Academic Health Center 1",                                    "address": "Academic Health Center 1, 1250 SW 108th Ave, Miami, FL 33199",                          "google_maps_place_id": "ChIJK98U_S2_2YgR2EqNnuRdJ3Q"},
    {"code": "AHC2",    "full_name": "Academic Health Center 2",                                    "address": "1240 S.W. 108 AVE, Path, Miami, FL 33174",                                              "google_maps_place_id": "ChIJaWPm4i2_2YgRw5EfQqMzYg0"},
    {"code": "AHC3",    "full_name": "Academic Health Center 3",                                    "address": "10910 SW 11th St, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJkwuR3y2_2YgRXz2OZoX_CW0"},
    {"code": "AHC4",    "full_name": "Academic Health Center 4",                                    "address": "Academic Health Center 4, 11200 SW 8th St, Miami, FL 33199",                            "google_maps_place_id": "ChIJ51REnKu_2YgRETdITrN0bq8"},
    {"code": "AHC5",    "full_name": "Academic Health Center 5",                                    "address": "10800 SW 10th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJ861vxS2_2YgRH5CICM6gB60"},
    {"code": "AS",      "full_name": "Digital Art Studio",                                          "address": "Artist Studio, Miami, FL 33175",                                                        "google_maps_place_id": "ChIJ5ajbZt-_2YgRS-4wJb3qv0Q"},
    {"code": "ASTRO",   "full_name": "Stocker Astroscience Center",                                 "address": "Stocker Astroscience Center, 10920 SW 11th St, Miami, FL 33174",                        "google_maps_place_id": "ChIJ6dnCTjC_2YgRy8YJDZFqJ00"},
    {"code": "BBS",     "full_name": "FIU Baseball Stadium",                                        "address": "FIU Baseball Stadium, SW 115th Ave, Miami, FL 33174",                                   "google_maps_place_id": "ChIJhSr4M-y_2YgRNHXb_72v2_g"},
    {"code": "BS",      "full_name": "Bike Shop",                                                   "address": "QJ59+8PW Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjU5KzhQVywgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoNCWpaDxUB4hbQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "BT",      "full_name": "location Ten",                                                "address": "1101 SW 112th Ave, Miami, FL 33174",                                                    "google_maps_place_id": "ChIJJyu5wi-_2YgRlgFXScFlpz0"},
    {"code": "CASE",    "full_name": "Computing, Arts, Sciences and Education",                     "address": "CASE, 11200 SW 8th St #450, Miami, FL 33199",                                           "google_maps_place_id": "ChIJHSkhSi6_2YgRlt3ZQBlOBCM"},
    {"code": "CBC",     "full_name": "College of Business Complex",                                 "address": "FIU College of Business, 11200 SW 8th St, Miami, FL 33199",                             "google_maps_place_id": "ChIJ9YTUViW_2YgRVf6QPuZouL0"},
    {"code": "CCLC",    "full_name": "Children's Creative Learning Center",                         "address": "CCLC, Modesto A. Maidique Campus, 11200 SW 8th St, Miami, FL 33199",                    "google_maps_place_id": "ChIJR-mMXDu_2YgRkf8L3sQ_3Yo"},
    {"code": "CFES",    "full_name": "Carlos Finlay Elementary School",                             "address": "CFES, 851 SW 117th Ave, Miami, FL 33184",                                               "google_maps_place_id": "ChIJdc2hQDy_2YgRnub-z8ezgnA"},
    {"code": "CP",      "full_name": "Chemistry & Physics",                                         "address": "10920 SW 11th St, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJbWYREi6_2YgROs8bYl2D5x4"},
    {"code": "CSC",     "full_name": "Campus Support Complex",                                      "address": "11600 SW 17th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJ4VnVhju_2YgRz59dut6k-Oo"},
    {"code": "DC",      "full_name": "Duplicating Center",                                          "address": "11205 SW 14th St, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJ_yY8bDC_2YgRuJaeVi-AE8o"},
    {"code": "DM",      "full_name": "Deuxieme Maison",                                             "address": "Deuxieme Maison, 11101 S.W. 13 ST., Miami, FL 33174",                                   "google_maps_place_id": "ChIJ28xJNjC_2YgRVlb36DU2Tow"},
    {"code": "EH",      "full_name": "Everglades Hall",                                             "address": "1590 SW 111th Ave, Miami, FL 33199",                                                    "google_maps_place_id": "ChIJkeOj7TC_2YgR45RqOfah1jE"},
    {"code": "FROST",   "full_name": "Patricia & Phillip Frost Art Museum",                         "address": "10975 SW 17th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJNbZeEjG_2YgRFD1TjUzJeBY"},
    {"code": "FSB",     "full_name": "Field Support location",                                      "address": "QJ4C+4F7 Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjRDKzRGNywgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoN6_FZDxUHKhfQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "GC",      "full_name": "Ernest R. Graham Center",                                     "address": "Ernest R.Graham Center, 10955 SW 15th Terrace, Miami, FL 33199",                        "google_maps_place_id": "ChIJbWv74i-_2YgRqsagPWgY2Qs"},
    {"code": "INV",     "full_name": "Innovation Complex",                                          "address": "QJ6J+57V Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjZKKzU3ViwgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoNC71aDxUfnRjQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "GL",      "full_name": "Steven and Dorothea Green Library",                           "address": "Steven and Dorothea Green Library, 11200 SW 8th St, Miami, FL 33199",                   "google_maps_place_id": "ChIJU1VV_i6_2YgR2eXTZcwzAWI"},
    {"code": "LC",      "full_name": "Labor Center",                                                "address": "Labor Center, 11251 SW 12th St, Miami, FL 33199",                                       "google_maps_place_id": "ChIJl-vToDq_2YgRPpCh6IwHVtc"},
    {"code": "LVN",     "full_name": "Lakeview Hall North",                                         "address": "Lakeview Hall North, Miami, FL 33165",                                                  "google_maps_place_id": "ChIJNZNx-TC_2YgR8lu7B47-zHw"},
    {"code": "LVS",     "full_name": "Lakeview Hall South",                                         "address": "11040 SW 14th St, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJFyHZVDC_2YgR8jt01CaoTSk"},
    {"code": "MANGO",   "full_name": "Management and New Growth Opportunities",                     "address": "MANGO, 11200 SW 8th St, Miami, FL 33199",                                               "google_maps_place_id": "ChIJpW-raYW_2YgRAnNKJWX7Z8E"},
    {"code": "MARC",    "full_name": "Management and Advanced Research Center",                     "address": "1550 SW 109th Ave, Miami, FL 33165",                                                    "google_maps_place_id": "ChIJP1DZCTG_2YgROfR6rqugyLM"},
    {"code": "NOAA",    "full_name": "National Hurricane Center",                                   "address": "11691 SW 17th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJe1AzbzC_2YgRHefZhodhnak"},
    {"code": "OBCC",    "full_name": "Ocean Bank Convocation Center",                               "address": "1180 SW 113th Ave, Miami, FL 33174",                                                    "google_maps_place_id": "ChIJcXfeVSW_2YgRPrR2T6INzwk"},
    {"code": "OE",      "full_name": "Owa Ehan",                                                    "address": "Owa Ehan, 11960 SW 11th St, Miami, FL 33174",                                           "google_maps_place_id": "ChIJ2fTCIi6_2YgR9_I-H-NYPV8"},
    {"code": "PBST",    "full_name": "Pitbull Stadium",                                             "address": "11310 SW 17th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJD5E6Gjq_2YgRHwaHuquJafg"},
    {"code": "PC",      "full_name": "Charles E. Perry location (Primera Casa)",                    "address": "Charles Perry location, 11001 SW 14th St, Miami, FL 33199",                             "google_maps_place_id": "ChIJJ8hAsTG_2YgRTDJ_cPoD3Ok"},
    {"code": "PCA",     "full_name": "Paul L. Cejas School of Architecture",                        "address": "Paul L. Cejas School of Architecture, 1025 SW 112th Ave Suite 280, Miami, FL 33174",    "google_maps_place_id": "ChIJ39G_wC-_2YgR51u_Bd9Sax4"},
    {"code": "PG1",     "full_name": "Gold Parking Garage",                                         "address": "10720 SW 16th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJ1bLkgzG_2YgRMtjszb3Njjk"},
    {"code": "PG2",     "full_name": "Blue Parking Garage",                                         "address": "10880 SW 16th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJtchs54a_2YgRcQib8XTqeNk"},
    {"code": "PG3",     "full_name": "Panther Parking Garage",                                      "address": "1060 SW 113th Ave, Miami, FL 33199",                                                    "google_maps_place_id": "ChIJFca-ZHW_2YgRl2h_hrGDijA"},
    {"code": "PG4",     "full_name": "Red Parking Garage",                                          "address": "Red Parking Garage, Miami, FL 33174",                                                   "google_maps_place_id": "ChIJt_WZO4e_2YgRue2rldBGRWs"},
    {"code": "PG5",     "full_name": "PG5 Market Station",                                          "address": "885 SW 109th Ave, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJfTXFfy6_2YgRSxId9c99awU"},
    {"code": "PG6",     "full_name": "Parking Garage 6",                                            "address": "PG6, 11200 SW 8th St, Miami, FL 33174",                                                 "google_maps_place_id": "ChIJZe0TdwC_2YgRlIJZQVb0Lgo"},
    {"code": "PH",      "full_name": "Panther Hall",                                                "address": "1595 SW 112th Ave, Miami, FL 33174",                                                    "google_maps_place_id": "ChIJxWx6nDC_2YgR92W29prh_ME"},
    {"code": "PVH",     "full_name": "Parkview Hall",                                               "address": "1599 SW 113th Ave, Miami, FL 33199",                                                    "google_maps_place_id": "ChIJ4WrdYTq_2YgRoILdqjT-U1w"},
    {"code": "RB",      "full_name": "Ryder Business location",                                     "address": "11210 SW 11th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJH-UA4y-_2YgRKLt8Xu9BJIM"},
    {"code": "RDB",     "full_name": "Rafael Diaz-Balart Hall",                                     "address": "Rafael Diaz-Balart Hall, 11291 SW 12th St, Miami, FL 33199",                            "google_maps_place_id": "ChIJNRXTI2e_2YgRYSmFiscy8Z4"},
    {"code": "RH",      "full_name": "Ronald W. Reagan Presidential House",                         "address": "10777 SW 16th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJCWNiRTK_2YgRI3-n1uNs6JY"},
    {"code": "SAAC",    "full_name": "Student Athletic Academic Center",                            "address": "SAAC, 11520 SW 12th Terrace, Miami, FL 33199",                                          "google_maps_place_id": "ChIJjX2AYzu_2YgRcumEAg17HU8"},
    {"code": "SASC",    "full_name": "Student Academic Success Center",                             "address": "SASC, 1401 SW 108th Ave, Miami, FL 33199",                                              "google_maps_place_id": "ChIJm4_MizG_2YgREpH8Oxggu7w"},
    {"code": "SH",      "full_name": "Solar House",                                                 "address": "998 SW 112th Ave, Miami, FL 33174",                                                     "google_maps_place_id": "ChIJ51XkiS-_2YgRfs_A6hN9MNw"},
    {"code": "SHC",     "full_name": "Student Health Center",                                       "address": "SHC, 11200 SW 8th St, Miami, FL 33199",                                                 "google_maps_place_id": "ChIJGwALczC_2YgRY6UYpO7aWhc"},
    {"code": "SIPA",    "full_name": "Steven J. Green School of International and Public Affairs",  "address": "SIPA, 11200 SW 8th St, Miami, FL 33199",                                                "google_maps_place_id": "ChIJ9_4nEjC_2YgR9iuT3_EBF1A"},
    {"code": "SPE",     "full_name": "Sigma Phi Epsilon Learning Center",                           "address": "10737 SW 17th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJAQDwXDu_2YgR1_YVRn1MmxI"},
    {"code": "TAM",     "full_name": "Tamiami Hall",                                                "address": "11201 SW 17th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJYSu-mCO_2YgRzRFuGr19mEY"},
    {"code": "TWR",     "full_name": "Tower/Veteran and Military Affairs",                          "address": "11220 SW 14th St, Miami, FL 33165",                                                     "google_maps_place_id": "ChIJt3uwcjC_2YgRVeotbRw3GQY"},
    {"code": "TDBC",    "full_name": "Trish & Dan Bell Chapel",                                     "address": "QJ4H+GVH Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjRIK0dWSCwgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoN9RlaDxWAeBjQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "UA",      "full_name": "University Apartments",                                       "address": "University Apartments, Miami, FL 33174",                                                "google_maps_place_id": "ChIJH13Iii2_2YgRtyS3JGGGQKo"},
    {"code": "UT",      "full_name": "University Towers",                                           "address": "11150 SW 14th St, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJIyWaYDC_2YgRWetOQFy8098"},
    {"code": "VH",      "full_name": "Viertes Haus",                                                "address": "Viertes Haus, 11110 SW 11th St, Miami, FL 33199",                                       "google_maps_place_id": "ChIJm9rHkdy_2YgRRdd22p8_yu0"},
    {"code": "WRC",     "full_name": "Wellness and Recreation Center",                              "address": "WRC, 11290 SW 12th St, Miami, FL 33199",                                                "google_maps_place_id": "ChIJ30fbHiW_2YgRS2dT19IbhmE"},
    {"code": "W01",     "full_name": "West 1 - Sculpture + Art Foundation",                         "address": "QJ39+433 Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjM5KzQzMywgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoNSY9ZDxVPoRbQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "W01C",    "full_name": "West 01C - Ceramics",                                         "address": "Ceramics, 11481 SW 18th St, Miami, FL 33175",                                           "google_maps_place_id": "ChIJSWsK5ju_2YgRGyoq3WWGNvU"},
    {"code": "W03",     "full_name": "West 3 - Key Control",                                        "address": "W2, 11530 SW 17th St, Miami, FL 33199",                                                 "google_maps_place_id": "ChIJd_jPCTy_2YgRkqDUCloksSQ"},
    {"code": "W06",     "full_name": "West 6 - Training Lab",                                       "address": "QJ49+75J Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjQ5Kzc1SiwgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoNhQJaDxXaqRbQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "W09",     "full_name": "West 9 - Painting",                                           "address": "11575-11615 SW 11th St, Miami, FL 33174",                                               "google_maps_place_id": "ChIJR23yoDy_2YgReJmKHipIMpc"},
    {"code": "W10",     "full_name": "West 10 - Drawing + MFA Studios",                             "address": "851 SW 117th Ave, Miami, FL 33199",                                                     "google_maps_place_id": "ChIJ786eliS_2YgR2MikJzftVd8"},
    {"code": "W10A",    "full_name": "ROTC - Reserve Officer Training Corps",                       "address": "Rotc-Reserve Officer Training Corps, Miami, FL 33174",                                  "google_maps_place_id": "ChIJPcaRuTy_2YgReSsia_o2D58"},
    {"code": "W10C",    "full_name": "West 10C Trailer",                                            "address": "QJ48+QR7 Westchester, Florida",                                                         "google_maps_place_id": "Eh5RSjQ4K1FSNywgV2VzdGNoZXN0ZXIsIEZMLCBVU0EiJjokCgoNZTFaDxXliBbQEAsaFAoSCdHoAMLBuNmIEbwGzYFxo2w6"},
    {"code": "WC",      "full_name": "Wertheim Conservatory",                                       "address": "Wertheim Conservatory, 11200 SW 8th St, Miami, FL 33199",                               "google_maps_place_id": "ChIJ9VNbQS6_2YgRCyeOn-dmdww"},
    {"code": "WPAC",    "full_name": "Herbert and Nicole Wertheim Performing Arts Center",          "address": "10910 SW 17th St, Miami, FL 33172",                                                     "google_maps_place_id": "ChIJs8yzocm-2YgRB1uXAE7bv4M"},
    {"code": "WSTC",    "full_name": "Women's Softball/Tennis Center",                              "address": "FIU Athletic Facilities, 11200 SW 8th St, Miami, FL 33199",                             "google_maps_place_id": "ChIJZ0GfJzu_2YgRFm0h9X8VDBk"},
    {"code": "ZEB",     "full_name": "Sanford L. Ziff Family Education location",                   "address": "1010 SW 112th Ave, Miami, FL 33174",                                                    "google_maps_place_id": "ChIJ861g9C-_2YgRqvil8hvLNOQ"},

    {"code": "EC",     "full_name": "Engineering Center",                                           "address": "10555 W Flagler St, Miami, FL 33174",                                                   "google_maps_place_id": "ChIJd7VebNW-2YgRAdPCOn7hsak"}
]

# Upload major
r = requests.post(f"{BASE_URL}/majors", json=major_data)
print("Major:", r.status_code, r.json())

# Upload course
for course_data in courses_data:
    r = requests.post(f"{BASE_URL}/courses", json=course_data)
    print("Course:", course_data["code"], r.status_code, r.json())

# Upload location
for location_data in locations:
    r = requests.post(f"{BASE_URL}/locations", json=location_data)
    print("location:", location_data["code"], r.status_code, r.json())
