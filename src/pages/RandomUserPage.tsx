import { useEffect, useState } from "react";
import axios from "axios";
import { UserCard } from "../components/UserCard";
import { cleanUser } from "../libs/CleanUser";

type CleanUser = {
  name: string;
  email: string;
  imgUrl: string;
  address: string;
};

const LS_KEY = "lab10.genAmount";

export default function RandomUserPage() {
  
  const [genAmount, setGenAmount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const n = saved !== null ? parseInt(saved, 10) : NaN;
      return !Number.isNaN(n) && n > 0 ? n : 1;
    } catch {
      return 1;
    }
  });
  const [users, setUsers] = useState<CleanUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (amount: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await axios.get(`https://randomuser.me/api/?results=${amount}`);
      const results = resp?.data?.results ?? [];
      const cleaned: CleanUser[] = results.map((u: any) => cleanUser(u));
      setUsers(cleaned);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, String(genAmount));
    } catch {
      
    }
  }, [genAmount]);

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      setGenAmount(1);
      return;
    }
    const parsed = parseInt(raw, 10);
    const value = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    setGenAmount(value);
  };

  const generateBtnOnClick = async () => {
    await generate(genAmount);
  };

  return (
    <div style={{ maxWidth: "700px" }} className="mx-auto">
      <p className="display-4 text-center fst-italic m-4">Users Generator</p>
      <div className="d-flex justify-content-center align-items-center fs-5 gap-2">
        Number of User(s)
        <input
          className="form-control text-center"
          style={{ maxWidth: "100px" }}
          type="number"
          min={1}
          onChange={onAmountChange}
          value={genAmount}
        />
        <button className="btn btn-dark" onClick={generateBtnOnClick} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      {isLoading && (
        <p className="display-6 text-center fst-italic my-4">Loading ...</p>
      )}

      {error && (
        <p className="text-danger text-center my-3">{error}</p>
      )}

      {!isLoading && users.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 g-3 my-4">
          {users.map((u) => (
            <div className="col" key={u.email}>
              <UserCard
                name={u.name}
                email={u.email}
                imgUrl={u.imgUrl}
                address={u.address}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
