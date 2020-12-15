import express from "express";
import { promises as fs } from "fs";
const router = express.Router();
export default router;

router.post("/", async (req, res, next) => {
  try {
    let grade = req.body;

    if (!grade.student || !grade.subject || !grade.type || !grade.value) {
      throw new Error("Insira todas os campos necessários");
    }

    const data = JSON.parse(await fs.readFile("grades.json"));
    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await fs.writeFile("grades.json", JSON.stringify(data, null, 2));
    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const grade = req.body;
    // prettier-ignore
    if (!grade.student || !grade.subject || !grade.type || !grade.value||!grade.id){
            throw new Error('Insira todos os campos')
        }

    const data = JSON.parse(await fs.readFile("grades.json"));
    const index = data.grades.findIndex((a) => {
      return a.id === grade.id;
    });

    if (index === -1) {
      throw new Error("Aluno não encontrado");
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;
    await fs.writeFile("grades.json", JSON.stringify(data, null, 2));
    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let data = JSON.parse(await fs.readFile("grades.json"));
    data.grades = data.grades.filter((a) => {
      return a.id !== parseInt(req.params.id);
    });

    await fs.writeFile("grades.json", JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let data = JSON.parse(await fs.readFile("grades.json"));
    const dataFiltred = data.grades.filter((a) => {
      return a.id === parseInt(req.params.id);
    });
    if (req.params.id > data.grades.length) {
      throw new Error("Aluno não encontrado");
    }
    res.send(dataFiltred);
  } catch (err) {
    next(err);
  }
});

router.get("/:subject/:student", async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile("grades.json"));
    const date = data.grades.filter((a) => {
      return a.subject === req.params.subject;
    });

    const userFilter = date.filter((a) => {
      return a.student === req.params.student;
    });

    const sumValues = userFilter.map((value) => {
      return value.value;
    });

    res.send(
      `Soma das notas: ${sumValues.reduce((acc, curr) => {
        return (acc += curr);
      })}`
    );
  } catch (err) {
    next(err);
  }
});

router.get("/media/:type/:subject", async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile("grades.json"));
    const type = data.grades.filter((a) => {
      return a.type === req.params.type;
    });

    const filtredMedia = type.filter((a) => {
      return a.subject === req.params.subject;
    });

    const media = filtredMedia.map((valor) => {
      return valor.value;
    });

    const correctMedia = media.reduce((acc, curr) => {
      return (acc += curr);
    });

    const teste = correctMedia / media.length;

    res.send(`Média das notas: ${teste}`);
  } catch (err) {
    next(err);
  }
});

router.get("/bestValues/:subject/:type", async (req, res, next) => {
  const data = JSON.parse(await fs.readFile("grades.json"));
  const subject = data.grades.filter((a) => {
    return a.subject === req.params.subject;
  });

  const type = subject.filter((a) => {
    return a.type === req.params.type;
  });

  const bestThreeValues = type.sort((a, b) => {
    return b.value - a.value;
  });

  res.send(bestThreeValues.splice(0, 3));
});

router.use((err, req, res, next) => {
  res.status(400).send({ err: err.message });
});
