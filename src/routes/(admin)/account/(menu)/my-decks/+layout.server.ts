import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
  locals,
  cookies,
  url,
  supabaseServiceRole,
}) => {
  // const { data: stripeSub, error: stripeSubError } =
  //       await supabaseServiceRole.rpc("get_stripe_subscription", {
  //         customer_id: data.stripeCustomerId,
  //       })

  //     if (stripeSubError)
  //       console.error("Error getting stripe Sub", stripeSubError)
  //     else console.log("stripe Sub ==", stripeSub)
  // console.log("user mydecks", locals)
  return {
    something: "hello",
  }
}
