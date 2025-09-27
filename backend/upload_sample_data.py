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
    "required_courses": ["MAC 2311", "MAC 2312", "STA 3033", "CGS 1920", "BSC 2010|CHM 1045|ESC 1000|PHY 2048", "BSC 2010L|CHM 1045L|PHY 2048L", "BSC 2011|GLY 3039|PHY 2049", "BSC 2011L|GLY 3039L|PHY 2049L", "CSG 1920", "ENC 3249|ENC 3213",  "COP 2210", "COT 3100|MAD 2104", "COP 3337", "CSG 3095", "CDA 3102", "COP 4336", "COP 3530", "CIS 3950", "CEN 4010", "COP 4610", "CNT 4713", "COP 4555", "CIS 4951"]
}

# Example course data
courses_data = [
    {
        "code": "MAC 1105",
        "name": "PreCalculus Algebra",
        "description": "In this course, students will develop problem solving skills, critical thinking, computational proficiency, and contextual fluency through the study of equations, functions, and their graphs. Emphasis will be placed on quadratic, exponential, and logarithmic functions. Topics will include solving equations and inequalities, definition and properties of a function, domain and range, transformations of graphs, operations on functions, composite and inverse functions, basic polynomial and rational functions, exponential and logarithmic functions, and applications.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "MAC 1140",
        "name": "PreCalculus Algebra",
        "description": "Covers polynomial, rational, exponential and logarithmic functions: zeros of polynomials; conic sections; determinant and Cramer¿s rule; sequences and series; induction; binomial theorem. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Students cannot receive credits for both this course and MAC 1147.",
        "credits": 3,
        "prereqs": ["MAC 1105"],
        "coreqs": []
    }, {
        "code": "MAC 1147",
        "name": "PreCalculus Algebra and Trigonometry",
        "description": "Polynomials, rational, exponential and logarithmic functions, trigonometry, conic sections, Cramer's rule, sequences and series, induction, binomial theorem. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Student cannot receive credit for both this course and MAC 1140 and/or MAC 1114.",
        "credits": 4,
        "prereqs": ["MAC 1105"],
        "coreqs": []
    }, {
        "code": "MAC 1114",
        "name": "Trigonometry",
        "description": "Trigonometric functions, identities, conditional equations, polar coordinates, vectors, polar graphs, complex numbers, DeMoivres theorem, conic sections. Students will determine appropriate mathematical and computational models and methods in problem solving and demonstrate an understanding of mathematical concepts. Students will apply appropriate mathematical and computational models and methods in problem solving. Student cannot receive credit for both this course and MAC 1147 pre-calculus.",
        "credits": 4,
        "prereqs": ["MAC 1105"],
        "coreqs": []
    }, {
        "code": "MAC 2233",
        "name": "Applied Calculus",
        "description": "Basic notions of differential and integral calculus using business applications and models including: differential and integral calculus using polynomials, exponential and logarithmic functions.",
        "credits": 4,
        "prereqs": ["MAC 1105"],
        "coreqs": []
    }, {
        "code": "MAC 2311",
        "name": "Calculus I",
        "description": "In this course, students will develop problem solving skills, critical thinking, computational proficiency, and contextual fluency through the study of limits, derivatives, and definite and indefinite integrals of functions of one variable, including algebraic, exponential, logarithmic, and trigonometric functions, and applications. Topics will include limits, continuity, differentiation and rates of change, optimization, curve sketching, and introduction to integration and area.",
        "credits": 4,
        "prereqs": ["MAC 1140|MAC 1147", "MAC 1114"],
        "coreqs": []
    }, {
        "code": "MAC 2312",
        "name": "Calculus II",
        "description": "Applications of the integral, integration techniques, improper integrals, Riemann sums, the integral, Fundamental Theorem of Calculus, infinite series, Taylor series, polar coordinates, parametric equations.",
        "credits": 4,
        "prereqs": ["MAC 2311"],
        "coreqs": []
    }, {
        "code": "MAC 2313",
        "name": "Multivariable Calc",
        "description": "This course deals with the differential and integral calculus of real valued multivariable functions. The topics include: directional and partial derivatives, gradients, and their applications; differential calculus of vector valued functions; multiple, iterated, line, and surface integrals.",
        "credits": 4,
        "prereqs": ["MAC 2312"],
        "coreqs": []
    }, {
        "code": "BSC 2010",
        "name": "General Biology I",
        "description": "In this course students will apply the scientific method to critically examine and explain the natural world. This course will cover molecular biology, cellular biology, genetics, metabolism, and replication. Concurrent registration in both lecture and laboratory is required.",
        "credits": 3,
        "prereqs": ["BSC 2010L"],
        "coreqs": ["BSC 2010L"]
    }, {
        "code": "BSC 2010L",
        "name": "General Biology I Lab",
        "description": "Biomolecules, cells, energy flow, genetics, and physiology. Science background or Biology major recommended.",
        "credits": 1,
        "prereqs": ["BSC 2010"],
        "coreqs": ["BSC 2010"]
    }, {
        "code": "CHM 1025",
        "name": "Fundamentals of Chemistry",
        "description": "ntroduces students to basic mathematics required in chemistry, nature of matter, atomic structure, simple chemical reactions and stoichiometry.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "CHM 1045",
        "name": "General Chemistry I",
        "description": "This course is designed for students pursuing careers in the sciences or who need a more rigorous presentation of chemical concepts than is offered in an introductory course. Students will engage in problem solving and critical thinking while applying chemical concepts. Topics will include the principles of chemistry including atomic theory, electronic and molecular structure, measurement, stoichiometry, bonding, periodicity, thermochemistry, nomenclature, solutions, and the properties of gases. Concurrent registration in both lecture and laboratory is required. (Lab fees assessed)",
        "credits": 3,
        "prereqs": ["MAC 1105|MAC 1114|MAC 1140|MAC 1147|MAC 2311|MAC 2312|MAC 2313|CHM 1025", "CHM 1045L"],
        "coreqs": ["CHM 1045L"]
    }, {
        "code": "CHM 1045L",
        "name": "General Chemistry I Lab",
        "description": "Fundamental principles of general chemistry: states of matter, atomic structure, stoichiometry, chemical bonding, acid-base reactions, and gas laws. Concurrent registration in both lecture and laboratory is required. (Lab fees assessed)",
        "credits": 1,
        "prereqs": ["CHM 1045"],
        "coreqs": ["CHM 1045"]
    }, {
        "code": "ESC 1000",
        "name": "Introduction to Earth Sciences",
        "description": "Using the scientific method, critical thinking skills, and data analysis, this course will examine the fundamental processes of the earth system, composed of an atmosphere, hydrosphere, lithosphere, biosphere, and exosphere, through time. The course will also explore interactions between these spheres, including critical analysis of scientific theories and emphasize earth's connections with humans. Students cannot get credit for both this course and GLY1010.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "PHY 2048",
        "name": "Physics with Calculus I",
        "description": "This calculus-based course serves as the first in a two-part series, covering topics like kinematics, dynamics, energy, momentum, rotational motion, fluid dynamics, oscillatory motion, and waves. Designed for science and engineering majors, the course integrates critical thinking, analytical skills, and real-world applications.",
        "credits": 4,
        "prereqs": ["PHY 2048L", "MAC 2311"],
        "coreqs": ["PHY 2048L"]
    }, {
        "code": "PHY 2053",
        "name": "Physics without Calculus I",
        "description": "This course is the first in a two-part series intended for non-physics majors, offering an algebra and trigonometry approach to topics such as kinematics, dynamics, energy, momentum, rotational motion, fluid dynamics, oscillatory motion, and waves. The course fosters analytical and critical thinking skills to promote a scientific understanding of the real world.",
        "credits": 4,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "PHY 2048L",
        "name": "General Physics Laboratory I",
        "description": "Laboratory sections of PHY 2048, 2049, PHY 2053, 2054.",
        "credits": 1,
        "prereqs": ["PHY 2048|PHY 2053"],
        "coreqs": ["PHY 2048|PHY 2053"]
    }, {
        "code": "BSC 2011",
        "name": "General Biology II: Diversity of Life, Organismal Structure and Function ",
        "description": "This course explores the question, what is life? Students will critically examine how microbes, plants, and animals are adapted to their environment, how they function, and how they interact with each other. Students will analyze the branches of the tree of life and learn how to reconstruct the evolution of this vast biodiversity, how it benefits us, and how it can be conserved and sustained. Throughout the course, students will develop scientific inquiry skills by analyzing evidence about the natural world. Concurrent registration in both lecture and lab is required.",
        "credits": 3,
        "prereqs": ["BSC 2011L"],
        "coreqs": ["BSC 2011L"]
    }, {
        "code": "BSC 2011L",
        "name": "General Biology Lab II",
        "description": "A survey of organismal biology with emphasis on botany and zoology. Science background or Biology major recommended. (Lab fees assessed)",
        "credits": 1,
        "prereqs": ["BSC 2011"],
        "coreqs": ["BSC 2011"]
    }, {
        "code": "GLY 3039",
        "name": "Environmental Geology",
        "description": "The composition and structure of the earth, the internal and external forces acting upon it and the resulting surface features. Case studies and general principles illustrated from South Florida and the Caribbean. Field trips expected. No prerequisites.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "GLY 3039L",
        "name": "Environmental Geology Lab",
        "description": "The composition and structure of the earth, the internal and external forces acting upon it and the resulting surface features. Case studies and general principles illustrated from South Florida and the Caribbean. Field trips expected. No prerequisites.",
        "credits": 1,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "PHY 2049",
        "name": "Physics with Calculus II",
        "description": "Second in basic physics with calculus sequence. Covers electricity and magnetism, field theory, geometrical and wave optics. PHZ 2103 strongly recommended for problem solving skills. Calculus II (MAC 2312 or equivalent) should be taken prior to or concurrent with this course. Prerequisites: PHY 2048, MAC 2312 or equivalent. Corequisite: MAC 2312 or equivalent.",
        "credits": 4,
        "prereqs": ["PHY 2048", "MAC 2312"],
        "coreqs": ["MAC 2312"]
    }, {
        "code": "PHY 2054",
        "name": "Physics W/O Calc II",
        "description": "Second in basic physics without calculus sequence. Covers electricity and magnetism, geometrical and wave optics and the structure of matter. PHY2166 strongly recommended for problem solving skills.",
        "credits": 4,
        "prereqs": ["PHY 2053|PHY 2048"],
        "coreqs": []
    }, {
        "code": "PHY 2049L",
        "name": "General Physics Laboratory II",
        "description": "Laboratory sections of PHY 2048, 2049, PHY 2053, 2054.",
        "credits": 1,
        "prereqs": ["PHY 2049|PHY 2054"],
        "coreqs": ["PHY 2049|PHY 2054"]
    }, {
        "code": "CGS 1920",
        "name": "Introduction to the Field of Computing",
        "description": "Overview of the computing field to students, research programs and career options.",
        "credits": 1,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "COP 1000",
        "name": "Introduction to Computer Programming",
        "description": "Uses graphics and animation in a media programming environment to teach problem solving and programming concepts to students with no prior experience. May not be taken after COP 2210 or COP 2250.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "IDC 1000",
        "name": "Computer Science for Everyone",
        "description": "Introduction to the breadth and excitement of computing, including its social context, computing principles, and relevance to all disciplines.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "COP 2210",
        "name": "Programming I",
        "description": "A first course in computer science that uses a structured programming language to study programming and problem solving on the computer. Includes the design, construction and analysis of programs. Student participation in a closed instructional lab is required. This course will have additional fees.",
        "credits": 4,
        "prereqs": ["MAC 1140|MAC 1147|MAC 2233|MAC 2311"],
        "coreqs": []
    }, {
        "code": "COP 2250",
        "name": "Java Programming",
        "description": "A first course in programming for IT majors. Syntax and semantics of Java. Classes and Objects. Object oriented program development. Not acceptable for credit for Computer Science majors. This course will have additional fees.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "EEL 2880",
        "name": "C Programming for Embedded Systems",
        "description": "Engineering problem solving process, overview of a generalized computing system, software development, real-life engineering applications, computational implications.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "COT 3100",
        "name": "Discrete Structures",
        "description": "Align mathematical and computational concepts by applying computing to propositional logic, sets, functions relations, induction, recursion, combinatorics, Boolean algebra, graph and trees. Prerequisites: MACXXXX Corequisites: (COP2210 or COP2250 or EEL2880)",
        "credits": 3,
        "prereqs": ["MAC 1105|MAC 1114|MAC 1140|MAC 1147|MAC 2233|MAC 2311|MAC 2312|MAC 2313"],
        "coreqs": ["COP 2210|COP 2250|EEL 2880"]
    }, {
        "code": "MAD 2104",
        "name": "Discrete Mathematics",
        "description": "Sets, functions, relations, permutations, and combinations, propositional logic, matrix algebra, graphs and trees, Boolean algebra, switching circuits.",
        "credits": 3,
        "prereqs": ["MAC 1105"],
        "coreqs": []
    }, {
        "code": "ENC 1101",
        "name": "Writing and Rhetoric I",
        "description": "This course introduces students to rhetorical concepts and audience-centered approaches to writing including composing processes, language conventions and style, and critical analysis and engagement with written texts and other forms of communication. Written work meets the state composition requirement. Completion of this course with a grade of C or better is linked to earning the Florida Public Postsecondary Fundamentals of Written Communication digital badge.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "ENC 1102",
        "name": "Writing and Rhetoric II",
        "description": "The second in a two-course sequence expands upon the writing and rhetorical strategies learned in ENC1101 and furthers students abilities to write and research arguments. Written work meets the state composition requirement. Completion of this course with a grade of C or better is linked to earning the Florida Public Postsecondary Fundamentals of Written Communication digital badge.",
        "credits": 3,
        "prereqs": ["ENC 1101"],
        "coreqs": []
    }, {
        "code": "ENC 2304",
        "name": "College Writing for Transfer Students",
        "description": "A course in the techniques of written exposition, argumentation, and research. The course is a prerequisite for transfer students (entering with 30 or more credits) taking further ENC classes. Written work meets the state composition requirement. Prerequisite: Transfer student.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "ENC 3249",
        "name": "Professional and Technical Writing for Computing",
        "description": "Introduces students to the expectations of written and verbal communication in the computer science profession; explores the ways in which technology and media help shape professional communication.",
        "credits": 3,
        "prereqs": ["ENC 1102|ENC 2304"],
        "coreqs": []
    }, {
        "code": "ENC 3213",
        "name": "Professional and Technical Writing",
        "description": "Principles and practices of effective workplace writing. Students learn audience analysis in order to become more effective writers. Genres include memos, business letters, proposals, and reports. Written work meets the state composition requirement.",
        "credits": 3,
        "prereqs": ["ENC 1101", "ENC 1102|ENC 2304"],
        "coreqs": []
    }, {
        "code": "COP 3337",
        "name": "Computer Programming II",
        "description": "An intermediate level course in Object Oriented programming. Topics include primitive types, control structures, strings arrays, objects and classes, data abstraction inheritance polymorphism and an introduction to data structures. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 2210"],
        "coreqs": ["MAD 2104"]
    }, {
        "code": "CDA 3102",
        "name": "Computer Architecture",
        "description": "Covers the levels of organization in a computer; digital logic; machine and assembly language programming, design of memory, buses, ALU, CPU; virtual memory, I/O.Prerequisite: COP 3337 and (COT 3100 or MAD 2104).",
        "credits": 3,
        "prereqs": ["COP 3337", "COT 3100|MAD 2104"],
        "coreqs": []
    }, {
        "code": "COP 2047",
        "name": "Python Programming I",
        "description": "Introduction to computer programming using Python including fundamental concepts and systematic design techniques. Students will write programs that computationally solve and reduce problems.",
        "credits": 3,
        "prereqs": [],
        "coreqs": []
    }, {
        "code": "COP 3045",
        "name": "Python Programming II",
        "description": "Object-oriented principles, handling modules, packages, and decorators, working with databases, data structures, and visualization tools. More complex Pythonic solutions for real-world challenges. Prerequisite: COP 2047 or COP 2210 or COP 2250 Corequisite: COP 3410",
        "credits": 3,
        "prereqs": ["COP 2047|COP 2210|COP 2250"],
        "coreqs": ["COP 3410"]
    }, {
        "code": "COP 3410",
        "name": "Computational Thinking",
        "description": "Computational thinking principles, covering algorithms, data structures, problem-solving, problem decomposition, creativity, and topics in recursion and ethical considerations in computing. Prerequisites: COP 2047 or COP 2210 or COP 2250 or Advisor's Permission.",
        "credits": 3,
        "prereqs": ["COP 2047|COP 2210|COP 2250"],
        "coreqs": []
    }, {
        "code": "CGS 3095",
        "name": "Technology in the Global Arena",
        "description": "Legal, ethical, social impacts of computer technology on society, governance, quality of life: intellectual property, privacy, security, professionalism, social identity in the U.S. and globally. Prerequisites: (COP 2250 or COP 2210 or COP 2047) and (ENC 3249 or ENC 3213). This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 2250|COP 2210|COP 2047", "ENC 3249|ENC 3213"],
        "coreqs": []
    }, {
        "code": "CEN 4010",
        "name": "Software Engineering I",
        "description": "Software Process Model, software analysis and specification, software design, testing. Prerequisites: CGS3095 and COP 3337",
        "credits": 3,
        "prereqs": ["CGS 3095", "COP 3337"],
        "coreqs": []
    }, {
        "code": "COP 4338",
        "name": "Systems Programming",
        "description": "Programming in C and advanced programming in Unix environments, including multiprocessing and multithreading. This course will have additional fees.",
        "credits": 3,
        "prereqs": [],
        "coreqs": ["COP 3530"]
    }, {
        "code": "COP 3530",
        "name": "Data Structures",
        "description": "Basic concepts of data organization, running time of a program, abstract types, data structures including linked lists, nary trees, sets and graphs, internal sorting. This course will have additional fees. Prerequisites: COP 3337 and (MAD 2104 or COT 3100)",
        "credits": 3,
        "prereqs": ["COP 3337", "MAD 2104|COT 3100"],
        "coreqs": []
    }, {
        "code": "COP 3538",
        "name": "Data Structures Fundamentals",
        "description": "Basic concepts of running time of a program, data structures including lists, stacks, queues, binary search trees, and hash tables, and internal sorting. Not acceptable for credit for CS majors. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 3410", "COP 3045"],
        "coreqs": []
    }, {
        "code": "CNT 4713",
        "name": "Net-centric Computing",
        "description": "This course covers networking fundamentals, network security, network applications, mobile and wireless computing. The course focuses on network programming, including sockets and web programming concepts.",
        "credits": 3,
        "prereqs": ["COP 4338"],
        "coreqs": []
    }, {
        "code": "COP 4555",
        "name": "Principles of Programming Languages",
        "description": "A comparative study of several programming languages and paradigms. Emphasis is given to design, evaluation and implementation. Programs are written in a few of the languages. This course will have additional fees. Prerequisite: COP 3530 or COP 3538",
        "credits": 3,
        "prereqs": ["COP 3530|COP 3538"],
        "coreqs": []
    }, {
        "code": "CDA 3103",
        "name": "Fundamentals of Computer Systems",
        "description": "Overview of computer systems organization. Data representation. Machine and assembly language programming. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 2210"],
        "coreqs": []
    }, {
        "code": "CDA 4101",
        "name": "Structured Computer Organization",
        "description": "Covers the levels of organization in a computer: Design of memory, buses, ALU, CPU; design of microprogram. Covers virtual memory, I/O, multiple processes, CISC, RISC and parallel architectures. Prerequisites: CDA 3103, COP 3337 and (MAD 2104 or COT 3100).",
        "credits": 3,
        "prereqs": ["CDA 3103", "COP 3337", "MAD 2104|COT 3100"],
        "coreqs": []
    }, {
        "code": "COP 4610",
        "name": "Operating Systems Principles",
        "description": "Operating systems design principles and implementation techniques. Address spaces, system call interface, process/threads, interprocess communication, deadlock, scheduling, memory, virtual memory, I/O, file systems. Prerequisites: COP 4338 AND (CDA 3102 OR CDA 4101) This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 4338", "CDA 3102|CDA 4101"],
        "coreqs": []
    }, {
        "code": "STA 3033",
        "name": "Introduction to Probability and Statistics for CS",
        "description": "Basic probability laws, probability distributions, basic sampling theory, point and interval estimation, tests of hypotheses, regression and correlation.",
        "credits": 3,
        "prereqs": ["MAC 2312"],
        "coreqs": []
    }, {
        "code": "COP 3804",
        "name": "Intermediate Java Programming",
        "description": "A second course in Java programming. Continues Programming in Java by discussing object-oriented programming in a more detail, with larger programming projects and emphasis on inheritance. Not acceptable for credit for CS majors. This course will have additional fees.",
        "credits": 3,
        "prereqs": ["COP 2250|COP 2210"],
        "coreqs": []
    }, {
        "code": "CIS 3950",
        "name": "Capstone I",
        "description": "Students learn how to perform efficiently in Agile/Scrum teams of up to 5 members and learn how to design and implement solutions to problems as a team. Prerequisite: (COP 3337 or COP 3804 or COP 3045) and Junior Standing",
        "credits": 3,
        "prereqs": ["COP 3337|COP 3804|COP 3045"],
        "coreqs": []
    }, {
        "code": "CIS 4951",
        "name": "Capstone II",
        "description": "Students work on faculty supervised projects in teams of up to 5 members to design and implement solutions to problems utilizing knowledge obtained across the spectrum of Computer Science courses. Prerequisite: CIS 3950 and Senior Standing.",
        "credits": 3,
        "prereqs": ["CIS 3950"],
        "coreqs": []
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
