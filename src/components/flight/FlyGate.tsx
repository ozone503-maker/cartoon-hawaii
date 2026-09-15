import { Component, type ReactNode } from "react";
import { useHawaii } from "@/lib/hawaii/store";

type Props = { children: ReactNode };
type State = { err: string | null };

export class FlyGate extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(e: Error): State {
    return { err: e.message || "3D failed" };
  }

  render() {
    if (this.state.err) {
      return <Fail message={this.state.err} onRetry={() => this.setState({ err: null })} />;
    }
    return this.props.children;
  }
}

function Fail({ message, onRetry }: { message: string; onRetry: () => void }) {
  const start = useHawaii((s) => s.start);
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-ocean p-6">
      <div className="w-full max-w-md rounded-xl bg-paper p-6 text-ink shadow-xl">
        <p className="font-display text-2xl">Couldn’t start the 3D view</p>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <button
          type="button"
          className="mt-6 min-h-12 w-full rounded-lg bg-coral text-cream"
          onClick={() => {
            onRetry();
            start();
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}