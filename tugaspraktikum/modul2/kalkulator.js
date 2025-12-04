const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const students = [];


const addStudent = (name, grades) => {
  const student = { name, grades }; 
  students.push(student);
};


const calcAvg = grades => {
  return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
};


const runCalculator = () => {
  
  rl.question('Nama mahasiswa? ', (name) => {
    if (!name) {
      console.log('Input nama wajib!');
      rl.close();
      return;
    }

    
    rl.question('Nilai (pisah koma, e.g. 80,90,70)? ', (inputGrades) => {
      const grades = inputGrades ? inputGrades.split(',').map(Number) : [];

      if (grades.length === 0) {
        console.log('Input nilai minimal satu!');
        runCalculator(); 
        return;
      }


      addStudent(name, grades);
      const avg = calcAvg(grades);

      
      const { name: studentName, grades: studentGrades } = students[students.length - 1];

      
      console.log(`\n--- HASIL ---`);
      console.log(`${studentName} - Rata-rata: ${avg.toFixed(2)}`);
      console.log(`Nilai: [${studentGrades.join(", ")}]`);
      

      if (avg >= 80) {
        console.log('Status: Lulus! 🎉');
      } else {
        console.log('Status: Belajar lagi! 📚');
      }
      
      console.table(students.map(({ name, grades }) => ({
        name,
        avg: calcAvg(grades).toFixed(2)
      })));

           rl.close();
    });
  });
};


runCalculator();