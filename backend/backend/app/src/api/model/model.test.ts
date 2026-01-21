// import Model from "./Model.js";

import Model from "./Model.js";


// const model = new Model('users', ['id', 'username', 'name', 'last_name', 'age', 'gender']);


// console.log("**********SELCET************")
// model.select({
//     where: {
//         OR: {
//             name: 'oussama',
//             AND: {
//                 age: 22,
//                 gender: "male",
//                 OR: {
//                     last_name: "khiar",
//                     gender: 'female',
//                 }
//             },
//             age: 20,
//         }
//     },
// })


// model.select({
//     where: {
//         OR: {
//             name: 'oussama',
//             AND: {
//                 age: 22,
//                 gender: "male",
//                 OR: {
//                     last_name: "khiar",
//                     gender: 'female',
//                 }
//             },
//             age: 20,
//         },
//     },
//     limit: 5,
//     orderBy: {
//         name: 'ASC',
//         age: 'DESC'
//     }
// })


// model.select({
//     where: {
//         AND: {
//             username: 'okhiar',
//             name: 'oussama',
//         }
//     },
//     limit: 5,
// })


// model.select({
//     where: {
//         id: 10,
//     },
//     limit: 5,
//     orderBy: {
//         name: 'ASC',
//         age: 'DESC'
//     }
// })

// model.select({
//     limit: 5,
//     orderBy: {
//         name: 'ASC',
//         age: 'DESC'
//     }
// })

// model.select({
//     where: {},
//     limit: 5,
//     orderBy: {
//         name: 'ASC',
//         age: 'DESC'
//     }
// })

// model.select();

// model.select({
//     where: {
//         username: "khiar",
//     },
//     orderBy: {

//     }
// })

// model.select({
//     where: {
//         usernamee: "khiar",
//     },
// })


// model.select({
//     where: {
//         username: "khiar",
//     },
//     orderBy: {
//         nameee: 'ASC',
//     }
// })

// model.select({
//     where: {
//         id: [1, 2]
//     },
//     orderBy: {
//         nameee: 'ASC',
//     }
// })

// console.log("*********CREATE*************")
// model.create({
//     username: 'okhiar',
//     name: 'oussama',
//     gender: 'male',
//     age: 22
// })

// model.create({
//     username: 'okhiar',
//     name: 'oussama',
//     gender: 'male',
//     first_name: 'chichi'
// })

// // ? Empty object, error in this case
// model.create({

// });

// console.log("***********UPDATE**********");
// model.update({}, {})

// model.update({
//     username: 'okhiar'
// }, {});

// model.update({
//     username: 'okhiar',
//     last_name: 'khiar',
//     name: 'oussama',
// }, {});

// model.update({
//     username: 'okhiar',
//     last_name: 'khiar',
//     name: 'oussama',
// }, {
//     OR: {
//         id: 20,
//         name: 'oussama',
//     }
// });

// // type TypeArray<T> = T[];

// // const arr: TypeArray = [1, 2, 3]


interface UserModel {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    biography: string;
    age: number;
    gender: 'male' | 'female';
}



const user = new Model<UserModel>('users');

// console.log("GOOD TESTS")
user.find();

user.find({
    where: {
        id: 12,
    }
})

user.find({
    where: {
        id: 12,
        username: 'okhiar'
    }
})

user.find({
    where: {
        id: 12,
        first_name: 'oussama',
    },
    limit: 5,
})

user.find({
    where: {
        id: 12,
        first_name: 'oussama',
    },
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})


user.find({
    where: {
        id: 12,
        first_name: 'oussama',
        AND: [
            {
                last_name: ["khiar"],
                age: [19]
            },
            {
                age: [18, 1],
                gender: ['male']
            }
        ]
    },
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})



user.find({
    where: {
        id: 12,
        first_name: 'oussama',
        OR: [
            {
                last_name: ["khiar"],
                age: [19]
            },
            {
                age: [18, 1],
                gender: ['male']
            }
        ]
    },
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})


user.find({
    where: {
        id: 12,
        first_name: 'oussama',
        OR:     [
            {
                last_name: ["khiar"],
                age: [19]
            },
            {
                age: [18, 1],
                gender: ['male'],
                AND: [
                    {
                        id: [1],
                        OR: [
                            {
                                username: ['okhiar'],
                                age: [18]
                            }
                        ]
                    }
                ]
            }
    ]
    },
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})


user.find({
    where: {
        id: 12,
        OR:     [
            {
                AND: [{id: [1], username: ['okhiar']}]
            },
            {
                AND: [{id: [1], username: ['okhiar']}]
            }
    ]
    },
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})

user.find({
    where: {
        AND: [
            {
                username: ['okhiar'],
                OR: [{id: [1, 2]}]
            },
            {
                AND: [{id: [2, 3, 45]}]
            }
        ],
    },
    attributes: ['age', 'username'],
    limit: 5,
    orderBy: {
        username: 'DESC',
    }
})

user.find({
    where: {
    },
})




console.log("*************INSERT QUERY**************")
user.create({
    username: 'okhiar',
    first_name: 'oussama',
    last_name: 'khiar',
    age: 20,
})



console.log("*************UPDATE QUERY**************")
user.update({
    username: 'okhiar',
    first_name: 'oussama',
    last_name: 'khiar',
}, {})

user.update({
    username: 'okhiar',
    first_name: 'oussama',
    last_name: 'khiar',
},  {
    id: 1,
    username: 'okhiar'
})


user.update({}, {})