import requests

# Change this if your server is running elsewhere
BASE_URL = "http://127.0.0.1:8000/api"

# Example user data
user_data = {
    "user_id": "u1",
    "major": "CS",
    "taken_classes": ["COP1000"],
    "current_courses": [],
    "blocked_time": {"day": "Mon", "time": "10:00-12:00"}
}

# Example major data
major_data = {
    "major_id": "COMPSC:BS",
    "name": "Bachelor of Science in Computer Science",
    "required_courses": ["MAC2311", "MAC2312", "STA3033", "CGS1920", "BSC2010|CHM1045|ESC1000|PHY2048", "BSC2010L|CHM1045L|PHY2048L", "BSC2011|GLY3039|PHY2049", "BSC2011L|GLY3039L|PHY2049L", "CSG1920", "ENC3249|ENC3213",  "COP2210", "COT3100|MAD2104", "COP3337", "CSG3095", "CDA3102", "COP4336", "COP3530", "CIS3950", "CEN4010", "COP4610", "CNT4713", "COP4555", "CIS4951"]
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
        "prereqs": ["MAC1140|MAC1147", "MAC1114"],
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
        "prereqs": ["MAC1105|MAC1114|MAC1140|MAC1147|MAC2311|MAC2312|MAC2313|CHM1025", "CHM1045L"],
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
        "prereqs": ["PHY2048|PHY2053"],
        "coreqs": ["PHY2048|PHY2053"]
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
        "prereqs": ["PHY2053|PHY2048"]
    }, {
        "code": "PHY2049L",
        "name": "Gen Physics Lab II",
        "description": "Laboratory sections of PHY 2048, 2049, PHY 2053, 2054.",
        "credits": 1,
        "prereqs": ["PHY2049|PHY2054"],
        "coreqs": ["PHY2049|PHY2054"]
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
        "prereqs": ["MAC1140|MAC1147|MAC2233|MAC2311"]
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
        "prereqs": ["MAC1105|MAC1114|MAC1140|MAC1147|MAC2233|MAC2311|MAC2312|MAC2313"],
        "coreqs": ["COP2210|COP2250|EEL2880"]
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
        "name": "Professional & Technical Writing for CS",
        "description": "Introduces students to the expectations of written and verbal communication in the computer science profession; explores the ways in which technology and media help shape professional communication.",
        "credits": 3,
        "prereqs": ["ENC1102|ENC2304"]
    }, {
        "code": "ENC3213",
        "name": "Professional & Technical Writing",
        "description": "Principles and practices of effective workplace writing. Students learn audience analysis in order to become more effective writers. Genres include memos, business letters, proposals, and reports. Written work meets the state composition requirement.",
        "credits": 3,
        "prereqs": ["ENC1101", "ENC1102|ENC2304"]
    }, {
        "code": "COP3337",
        "name": "Computer Programming II",
        "description": "An intermediate level course in Object Oriented programming. Topics include primitive types, control structures, strings arrays, objects and classes, data abstraction inheritance polymorphism and an introduction to data structures. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2210"],
        "coreqs": ["MAD2104"]
    }, {
        "code": "CDA3102",
        "name": "Computer Architecture",
        "description": "Covers the levels of organization in a computer; digital logic; machine and assembly language programming, design of memory, buses, ALU, CPU; virtual memory, I/O.Prerequisite: COP 3337 and (COT 3100 or MAD 2104).",
        "credits": 3,
        "prereqs": ["COP3337", "COT3100|MAD2104"]
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
        "prereqs": ["COP2047|COP2210|COP2250"],
        "coreqs": ["COP3410"]
    }, {
        "code": "COP3410",
        "name": "Computational Thinking",
        "description": "Computational thinking principles, covering algorithms, data structures, problem-solving, problem decomposition, creativity, and topics in recursion and ethical considerations in computing. Prerequisites: COP 2047 or COP 2210 or COP 2250 or Advisor's Permission.",
        "credits": 3,
        "prereqs": ["COP2047|COP2210|COP2250"]
    }, {
        "code": "CGS3095",
        "name": "Technology in the Global Arena",
        "description": "Legal, ethical, social impacts of computer technology on society, governance, quality of life: intellectual property, privacy, security, professionalism, social identity in the U.S. and globally. Prerequisites: (COP 2250 or COP 2210 or COP 2047) and (ENC 3249 or ENC 3213). This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP2250|COP2210|COP2047", "ENC3249|ENC3213"]
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
        "prereqs": ["COP3337", "MAD2104|COT3100"]
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
        "name": "Principles of Programming Languages",
        "description": "A comparative study of several programming languages and paradigms. Emphasis is given to design, evaluation and implementation. Programs are written in a few of the languages. This course will have additional fees. Prerequisite: COP 3530 or COP 3538",
        "credits": 3,
        "prereqs": ["COP3530|COP3538"]
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
        "prereqs": ["CDA3103", "COP3337", "MAD2104|COT3100"]
    }, {
        "code": "COP4610",
        "name": "OS Principles",
        "description": "Operating systems design principles and implementation techniques. Address spaces, system call interface, process/threads, interprocess communication, deadlock, scheduling, memory, virtual memory, I/O, file systems. Prerequisites: COP 4338 AND (CDA 3102 OR CDA 4101) This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP4338", "CDA3102|CDA4101"]
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
        "prereqs": ["COP2250|COP2210"]
    }, {
        "code": "CIS3950",
        "name": "Capstone I",
        "description": "Students learn how to perform efficiently in Agile/Scrum teams of up to 5 members and learn how to design and implement solutions to problems as a team. Prerequisite: (COP 3337 or COP 3804 or COP 3045) and Junior Standing",
        "credits": 3,
        "prereqs": ["COP3337|COP3804|COP3045"]
    }, {
        "code": "CIS4951",
        "name": "Capstone II",
        "description": "Students work on faculty supervised projects in teams of up to 5 members to design and implement solutions to problems utilizing knowledge obtained across the spectrum of Computer Science courses. Prerequisite: CIS 3950 and Senior Standing.",
        "credits": 3,
        "prereqs": ["CIS3950"]
    }
]

# Upload user
r = requests.post(f"{BASE_URL}/users", json=user_data)
print("User:", r.status_code, r.json())

# Upload major
r = requests.post(f"{BASE_URL}/majors", json=major_data)
print("Major:", r.status_code, r.json())

# Upload course
for course_data in courses_data:
    r = requests.post(f"{BASE_URL}/courses", json=course_data)
    print("Course:", course_data["code"], r.status_code, r.json())
