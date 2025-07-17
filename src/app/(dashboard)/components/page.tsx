import Category2And3Demo from "@/components/demo/Category2And3Demo";
import ComponentDemo from "@/components/demo/ComponentDemo";
import Category4Demo from "@/components/demo/Category4Demo";

export default function ComponentsPage() {
  return (
    <div className="flex flex-col">
      <ComponentDemo />
      <Category2And3Demo />
      <Category4Demo />
    </div>
  );
}
